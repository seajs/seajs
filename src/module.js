/**
 * module.js - The core of module loader
 */

var cachedMods = seajs.cache = {}
var anonymousMeta

var fetchingList = {}
var fetchedList = {}
var callbackList = {}

var STATUS = {
  // 1 - The module file is being fetched now
  FETCHING: 1,
  // 2 - The module data has been saved to cachedMods
  SAVED: 2,
  // 3 - The module and all its dependencies are ready to execute
  LOADED: 3,
  // 4 - The module is being executed
  EXECUTING: 4,
  // 5 - The module is executed and `module.exports` is available
  EXECUTED: 5
}

function Module(uri) {
  this.uri = uri
  this.dependencies = []
  this.exports = null
  this.status = 0
  this.callbacks = []
}

function resolve(ids, refUri) {
  if (isArray(ids)) {
    var ret = []
    for (var i = 0, len = ids.length; i < len; i++) {
      ret[i] = resolve(ids[i], refUri)
    }
    return ret
  }

  // Emit `resolve` event for plugins such as plugin-text
  var emitData = { id: ids, refUri: refUri }
  emit("resolve", emitData)

  return emitData.uri || id2Uri(emitData.id, refUri)
}

function use(uris, callback) {
  isArray(uris) || (uris = [uris])

  load(uris, function() {
    var exports = []

    for (var i = 0, len = uris.length; i < len; i++) {
      exports[i] = getExports(cachedMods[uris[i]])
    }

    if (callback) {
      callback.apply(global, exports)
    }
  })
}

function load(uris, callback) {
  // Emit `load` event for plugins such as plugin-combo
  emit("load", uris)

  var len = uris.length
  var remain = len
  var mod

  // Initialize modules
  for (var i = 0; i < len; i++) {
    mod = getModule(uris[i])

    if (mod.status < STATUS.LOADED) {
      mod.callbacks.push(done)
    }
    else {
      remain--
    }
  }

  if (remain === 0) {
    callback()
    return
  }

  // Start parallel loading
  for (i = 0; i < len; i++) {
    mod = getModule(uris[i])

    if (mod.status < STATUS.FETCHING) {
      fetch(mod.uri, function() {
        _load(mod)
      })
    }
    else if (mod.status === STATUS.SAVED) {
      _load(mod)
    }
  }

  // Check whether all unloaded uris are loaded
  function done() {
    if (--remain === 0) {
      callback()
    }
  }

}

function _load(mod) {
  load(mod.dependencies, function() {
    mod.status = STATUS.LOADED

    // Fire loaded callbacks
    var fn, fns = mod.callbacks
    mod.callbacks = []
    while ((fn = fns.shift())) fn()
  })
}

function fetch(uri, callback) {
  cachedMods[uri].status = STATUS.FETCHING

  // Emit `fetch` event for plugins such as plugin-combo
  var emitData = { uri: uri }
  emit("fetch", emitData)
  var requestUri = emitData.requestUri || uri

  if (fetchedList[requestUri]) {
    callback()
    return
  }

  if (fetchingList[requestUri]) {
    callbackList[requestUri].push(callback)
    return
  }

  fetchingList[requestUri] = true
  callbackList[requestUri] = [callback]

  // Emit `request` event for plugins such as plugin-text
  emit("request", emitData = {
    uri: uri,
    requestUri: requestUri,
    callback: onRequested,
    charset: data.charset
  })

  if (!emitData.requested) {
    request(emitData.requestUri, onRequested, emitData.charset)
  }

  function onRequested() {
    delete fetchingList[requestUri]
    fetchedList[requestUri] = true

    // Save meta data of anonymous module
    if (anonymousMeta) {
      save(uri, anonymousMeta)
      anonymousMeta = undefined
    }

    // Call callbacks
    var fn, fns = callbackList[requestUri]
    delete callbackList[requestUri]
    while ((fn = fns.shift())) fn()
  }
}

function define(id, deps, factory) {
  var argsLen = arguments.length

  // define(factory)
  if (argsLen === 1) {
    factory = id
    id = undefined
  }
  // define(id, factory)
  else if (argsLen === 2) {
    factory = deps
    deps = undefined
  }

  // Parse dependencies according to the module factory code
  if (!isArray(deps) && isFunction(factory)) {
    deps = parseDependencies(factory.toString())
  }

  var meta = {
    id: id,
    uri: resolve(id),
    deps: deps,
    factory: factory
  }

  // Try to derive uri in IE6-9 for anonymous modules
  if (!meta.uri && doc.attachEvent) {
    var script = getCurrentScript()

    if (script) {
      meta.uri = script.src
    }
    else {
      log("Failed to derive: " + factory)

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the uri
    }
  }

  // Emit `define` event, used in plugin-nocache, seajs node version etc
  emit("define", meta)

  meta.uri ? save(meta.uri, meta) :
      // Save information for "saving" work in the script onload event
      anonymousMeta = meta
}

function save(uri, meta) {
  var mod = getModule(uri)

  // Do NOT override already saved modules
  if (mod.status < STATUS.SAVED) {
    mod.id = meta.id || uri
    mod.dependencies = resolve(meta.deps || [], uri)
    mod.factory = meta.factory
    mod.status = STATUS.SAVED
  }
}

function exec(mod) {
  // Return `null` when `mod` is invalid
  if (!mod) {
    return null
  }

  // When module is executed, DO NOT execute it again. When module
  // is being executed, just return `module.exports` too, for avoiding
  // circularly calling
  if (mod.status >= STATUS.EXECUTING) {
    return mod.exports
  }

  mod.status = STATUS.EXECUTING


  function resolveInThisContext(id) {
    return resolve(id, mod.uri)
  }

  function require(id) {
    return getExports(cachedMods[resolveInThisContext(id)])
  }

  require.resolve = resolveInThisContext

  require.async = function(ids, callback) {
    use(resolveInThisContext(ids), callback)
    return require
  }


  var factory = mod.factory

  var exports = isFunction(factory) ?
      factory(require, mod.exports = {}, mod) :
      factory

  mod.exports = exports === undefined ? mod.exports : exports
  mod.status = STATUS.EXECUTED

  return mod.exports
}


// Helpers

function getModule(uri) {
  return cachedMods[uri] || (cachedMods[uri] = new Module(uri))
}

function getExports(mod) {
  var exports = exec(mod)

  if (exports === null && (!mod || !IS_CSS_RE.test(mod.uri))) {
    emit("error", mod)
  }
  
  return exports
}

function preload(callback) {
  var preloadMods = data.preload
  var len = preloadMods.length

  if (len) {
    use(resolve(preloadMods), function() {
      // Remove the loaded preload modules
      preloadMods.splice(0, len)

      // Allow preload modules to add new preload modules
      preload(callback)
    })
  }
  else {
    callback()
  }
}


// Public API

seajs.use = function(ids, callback) {
  // Load preload modules before all other modules
  preload(function() {
    use(resolve(ids), callback)
  })
  return seajs
}

global.define = define


// For developers
seajs.Module = Module
Module.STATUS = STATUS
Module.load = use
data.fetchedList = fetchedList

seajs.resolve = id2Uri

seajs.require = function(id) {
  return (cachedMods[id2Uri(id)] || {}).exports
}

