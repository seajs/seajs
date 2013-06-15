/**
 * module.js - The core of module loader
 */

var cachedMods = seajs.cache = {}
var anonymousMeta

var fetchingList = {}
var fetchedList = {}
var callbackList = {}

var STATUS = Module.STATUS = {
  // 1 - The `module.uri` is being fetched
  FETCHING: 1,
  // 2 - The meta data has been saved to cachedMods
  SAVED: 2,
  // 3 - The `module.dependencies` are being loaded
  LOADING: 3,
  // 3 - The module are ready to execute
  LOADED: 4,
  // 4 - The module is being executed
  EXECUTING: 5,
  // 5 - The `module.exports` is available
  EXECUTED: 6
}


function Module(uri, deps) {
  this.uri = uri
  this.dependencies = deps || []
  this.exports = null
  this.status = 0

  // Who depend on me
  this._waitings = {}
  // The number of unloaded dependencies
  this._remain = 0
  // The cache for _resolve method to speed up performance
  this._resolveCache = {}
  // This function will be called when onload
  this._callback = null
}

Module.get = function(uri, deps) {
  return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
}

// Resolve module.dependencies
Module.prototype._resolve = function() {
  var mod = this
  var ids = mod.dependencies, id
  var cache = mod._resolveCache
  var uris = [], uri

  for (var i = 0, len = ids.length; i < len; i++) {
    id = ids[i]
    uri = cache[id]

    // Use `isString` to exclude values such as "toString" etc.
    uris[i] = isString(uri) ?
        uri : (cache[id] = resolve(id, mod.uri))
  }

  return uris
}

// Load module.dependencies and fire onload when all done
Module.prototype._load = function() {
  var mod = this

  // If the module is being loaded, just wait it onload call
  if (mod.status >= STATUS.LOADING) {
    return
  }

  mod.status = STATUS.LOADING

  // Emit `load` event for plugins such as plugin-combo
  var uris = mod._resolve()
  emit("load", uris)

  var len = mod._remain = uris.length
  var m

  // Initialize modules and register waitings
  for (var i = 0; i < len; i++) {
    m = Module.get(uris[i])

    if (m.status < STATUS.LOADED) {
      // Maybe duplicate
      m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1
    }
    else {
      mod._remain--
    }
  }

  if (mod._remain === 0) {
    mod._onload()
    return
  }

  // Begin parallel loading
  for (i = 0; i < len; i++) {
    m = cachedMods[uris[i]]

    if (m.status < STATUS.FETCHING) {
      m._fetch()
    }
    else if (m.status === STATUS.SAVED) {
      m._load()
    }
  }
}

// Call this method when module is loaded
Module.prototype._onload = function() {
  var mod = this
  mod.status = STATUS.LOADED

  // Call onload callback
  if (mod._callback) {
    mod._callback()
  }

  // Notify waiting modules to fire onload
  var waitings = mod._waitings
  var uri, m

  for (uri in waitings) {
    if (waitings.hasOwnProperty(uri)) {
      m = cachedMods[uri]
      m._remain -= waitings[uri]
      if (m._remain === 0) {
        m._onload()
      }
    }
  }
}

// Fetch a module
Module.prototype._fetch = function() {
  var mod = this
  var uri = mod.uri

  mod.status = STATUS.FETCHING

  // Emit `fetch` event for plugins such as plugin-combo
  var emitData = { uri: uri }
  emit("fetch", emitData)
  var requestUri = emitData.requestUri || uri

  // Empty uri or a non-CMD module
  if (!requestUri || fetchedList[requestUri]) {
    mod._load()
    return
  }

  if (fetchingList[requestUri]) {
    callbackList[requestUri].push(mod)
    return
  }

  fetchingList[requestUri] = true
  callbackList[requestUri] = [mod]

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
    var m, mods = callbackList[requestUri]
    delete callbackList[requestUri]
    while ((m = mods.shift())) m._load()
  }
}

// Execute a module
Module.prototype._exec = function () {
  var mod = this

  // When module is executed, DO NOT execute it again. When module
  // is being executed, just return `module.exports` too, for avoiding
  // circularly calling
  if (mod.status >= STATUS.EXECUTING) {
    return mod.exports
  }

  mod.status = STATUS.EXECUTING


  // Create require
  var uri = mod.uri

  function require(id) {
    return getExports(cachedMods[require.resolve(id)])
  }

  require.resolve = function(id) {
    return mod._resolveCache[id] || resolve(id, uri)
  }

  require.async = function(ids, callback) {
    use(ids, callback, uri + "_async_" + cid())
    return require
  }


  // Exec factory

  var factory = mod.factory

  var exports = isFunction(factory) ?
      factory(require, mod.exports = {}, mod) :
      factory

  mod.exports = exports === undefined ? mod.exports : exports
  mod.status = STATUS.EXECUTED

  return mod.exports
}

// Define a module
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
    deps: deps || [],
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

// Use function is equal to load a anonymous module
function use(ids, callback, uri) {
  var mod = Module.get(
      uri || data.cwd + "_anonymous_" + cid(),
      isArray(ids) ? ids : [ids]
  )

  mod._callback = function() {
    var exports = []
    var uris = mod._resolve()

    for (var i = 0, len = uris.length; i < len; i++) {
      exports[i] = getExports(cachedMods[uris[i]])
    }

    if (callback) {
      callback.apply(global, exports)
    }
  }

  mod._load()
}


// Helpers

function resolve(id, refUri) {
  // Emit `resolve` event for plugins such as plugin-text
  var emitData = { id: id, refUri: refUri }
  emit("resolve", emitData)

  return emitData.uri || id2Uri(emitData.id, refUri)
}

function save(uri, meta) {
  var mod = Module.get(uri)

  // Do NOT override already saved modules
  if (mod.status < STATUS.SAVED) {
    mod.id = meta.id || uri
    mod.dependencies = meta.deps
    mod.factory = meta.factory
    mod.status = STATUS.SAVED
  }
}

function getExports(mod) {
  var exports = mod._exec()

  if (exports === null && !IS_CSS_RE.test(mod.uri)) {
    emit("error", mod)
  }

  return exports
}

function preload(callback) {
  var preloadMods = data.preload
  var len = preloadMods.length

  if (len) {
    use(preloadMods, function() {
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
    use(ids, callback)
  })
  return seajs
}

global.define = define


// For Developers

seajs.Module = Module
data.fetchedList = fetchedList

seajs.resolve = id2Uri
seajs.require = function(id) {
  return (cachedMods[resolve(id)] || {}).exports
}

