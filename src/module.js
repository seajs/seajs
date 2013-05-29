/**
 * module.js - The core of module loader
 */

var cachedModules = seajs.cache = {}
var anonymousModuleData

var fetchingList = {}
var fetchedList = {}
var callbackList = {}

// 1 - The module file is being fetched now
// 2 - The module data has been saved to cachedModules
// 3 - The module dependencies are being loaded
// 4 - The module and all its dependencies are ready to execute
// 5 - The module is being executed
// 6 - The module is executed and `module.exports` is available
var STATUS_FETCHING = 1
var STATUS_SAVED = 2
var STATUS_LOADING = 3
var STATUS_LOADED = 4
var STATUS_EXECUTING = 5
var STATUS_EXECUTED = 6


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
  var data = { id: ids, refUri: refUri }
  emit("resolve", data)

  return data.uri || id2Uri(data.id, refUri)
}

function use(uris, callback) {
  isArray(uris) || (uris = [uris])

  load(uris, function() {
    var exports = []

    for (var i = 0, len = uris.length; i < len; i++) {
      exports[i] = getExports(cachedModules[uris[i]])
    }

    if (callback) {
      callback.apply(global, exports)
    }
  })
}

function load(uris, callback) {
  var unloadedUris = getUnloadedUris(uris)

  if (unloadedUris.length === 0) {
    callback()
    return
  }

  // Emit `load` event for plugins such as plugin-combo
  emit("load", unloadedUris)

  var remain = unloadedUris.length
  var i, len

  // Handle LOADING modules
  for (i = remain - 1; i >= 0; i--) {
    var mod = cachedModules[unloadedUris[i]]
    if (mod.status === STATUS_LOADING) {
      unloadedUris.splice(i, 1)
      mod.callbacks.push(done)
    }
  }

  // Start parallel loading
  for (i = 0, len = unloadedUris.length; i < len; i++) {
    _load(unloadedUris[i])
  }

  function _load(uri) {
    var mod = cachedModules[uri]

    mod.status < STATUS_SAVED ?
        fetch(uri, loadDeps) :
        loadDeps()

    function loadDeps() {
      if (mod.status < STATUS_LOADING) {
        mod.status = STATUS_LOADING
      }

      load(mod.dependencies, function() {
        // DO NOT change status when it is great than LOADED
        if (mod.status < STATUS_LOADED) {
          mod.status = STATUS_LOADED
        }

        // Fire onload callbacks
        var fn, fns = mod.callbacks
        mod.callbacks = []
        while ((fn = fns.shift())) fn()

        // Check whether all unloadedUris are loaded
        done()
      })
    }
  }

  function done() {
    if (--remain === 0) {
      callback()
    }
  }

}

function fetch(uri, callback) {
  cachedModules[uri].status = STATUS_FETCHING

  // Emit `fetch` event for plugins such as plugin-combo
  var data = { uri: uri }
  emit("fetch", data)
  var requestUri = data.requestUri || uri

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
  var charset = configData.charset
  emit("request", data = {
    uri: uri,
    requestUri: requestUri,
    callback: onRequested,
    charset: charset
  })

  if (!data.requested) {
    request(data.requestUri, onRequested, charset)
  }

  function onRequested() {
    delete fetchingList[requestUri]
    fetchedList[requestUri] = true

    // Save meta data of anonymous module
    if (anonymousModuleData) {
      save(uri, anonymousModuleData)
      anonymousModuleData = undefined
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

  var data = {
    id: id,
    uri: resolve(id),
    deps: deps,
    factory: factory
  }

  // Try to derive uri in IE6-9 for anonymous modules
  if (!data.uri && doc.attachEvent) {
    var script = getCurrentScript()

    if (script) {
      data.uri = script.src
    }
    else {
      log("Failed to derive: " + factory)

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the uri
    }
  }

  // Emit `define` event, used in plugin-nocache, seajs node version etc
  emit("define", data)

  data.uri ? save(data.uri, data) :
      // Save information for "saving" work in the script onload event
      anonymousModuleData = data
}

function save(uri, meta) {
  var mod = getModule(uri)

  // Do NOT override already saved modules
  if (mod.status < STATUS_SAVED) {
    mod.id = meta.id || uri
    mod.dependencies = resolve(meta.deps || [], uri)
    mod.factory = meta.factory
    mod.status = STATUS_SAVED
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
  if (mod.status >= STATUS_EXECUTING) {
    return mod.exports
  }

  mod.status = STATUS_EXECUTING


  function resolveInThisContext(id) {
    return resolve(id, mod.uri)
  }

  function require(id) {
    return getExports(cachedModules[resolveInThisContext(id)])
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
  mod.status = STATUS_EXECUTED

  return mod.exports
}

Module.prototype.destroy = function() {
  delete cachedModules[this.uri]
  delete fetchedList[this.uri]
}


// Helpers

function getModule(uri) {
  return cachedModules[uri] ||
      (cachedModules[uri] = new Module(uri))
}

function getUnloadedUris(uris) {
  var ret = []

  for (var i = 0, len = uris.length; i < len; i++) {
    var uri = uris[i]
    if (uri && getModule(uri).status < STATUS_LOADED) {
      ret.push(uri)
    }
  }

  return ret
}

function getExports(mod) {
  var exports = exec(mod)

  if (exports === null && (!mod || !IS_CSS_RE.test(mod.uri))) {
    emit("error", mod)
  }
  
  return exports
}

function preload(callback) {
  var preloadMods = configData.preload
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

seajs.Module = Module
Module.load = use

seajs.resolve = id2Uri
global.define = define

seajs.require = function(id) {
  return (cachedModules[id2Uri(id)] || {}).exports
}

