/**
 * module.js - The core of module loader
 */

var cachedModules = seajs.cache = {}
var anonymousModuleMeta

var fetchingList = {}
var fetchedList = {}
var callbackList = {}
var waitingsList = {}

var STATUS = Module.STATUS = {
  "FETCHING": 1,    // The module file is being fetched now
  "SAVED": 2,       // The module data has been saved to cachedModules
  "LOADED": 3,      // The module and all its dependencies are ready to execute
  "EXECUTING": 4,   // The module is being executed
  "EXECUTED": 5     // The module is executed and `module.exports` is available
}

function Module(uri) {
  this.uri = uri
  this.dependencies = []
  this.exports = null
  this.status = 0
}

function resolve(ids, refUri) {
  if (isArray(ids)) {
    var ret = []
    for (var i = 0; i < ids.length; i++) {
      ret[i] = resolve(ids[i], refUri)
    }
    return ret
  }

  // Emit `resolve` event for plugins such as plugin-text
  var data = { id: ids, refUri: refUri }
  emit("resolve", data)

  return data.uri || id2Uri(data.id, refUri)
}

function use(ids, callback) {
  var uris = resolve(ids)
  isArray(uris) || (uris = [uris])

  load(uris, function() {
    var exports = []

    for (var i = 0; i < uris.length; i++) {
      exports[i] = exec(cachedModules[uris[i]])
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

  var len = unloadedUris.length
  var remain = len

  for (var i = 0; i < len; i++) {
    (function(uri) {
      var mod = cachedModules[uri]

      mod.status < STATUS.SAVED ? fetch(uri, onFetched) : onFetched()

      function onFetched() {
        // Maybe failed to fetch successfully, such as 404 error
        // In these cases, just call `cb` function directly
        if (mod.status < STATUS.SAVED) {
          done()
          return
        }

        // Break circular waiting callbacks
        if (isCircularWaiting(mod)) {
          printCircularLog(circularStack)
          circularStack.length = 0
          done()
          return
        }

        // Load all unloaded dependencies
        var waitings = waitingsList[uri] = getUnloadedUris(mod.dependencies)
        waitings.length ? load(waitings, done) : done()
      }

      function done() {
        mod.status = STATUS.LOADED
        if (--remain === 0) {
          callback()
        }
      }

    })(unloadedUris[i])
  }
}

function fetch(uri, callback) {
  cachedModules[uri].status = STATUS.FETCHING

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
    if (anonymousModuleMeta) {
      save(uri, anonymousModuleMeta)
      anonymousModuleMeta = undefined
    }

    // Call callbacks
    var fn, fns = callbackList[requestUri]
    delete callbackList[requestUri]
    while ((fn = fns.shift())) fn()
  }
}

function define(id, deps, factory) {
  var argsLen = arguments.length

  // HANDLE: define(factory)
  if (argsLen === 1) {
    factory = id
    id = undefined
  }
  // HANDLE: define(id || deps, factory)
  else if (argsLen === 2) {
    factory = deps
    deps = undefined

    // HANDLE: define(deps, factory)
    if (isArray(id)) {
      deps = id
      id = undefined
    }
  }

  // Try to derive uri in IE6-9 for anonymous modules
  if (!id && doc.attachEvent) {
    var script = getCurrentScript()

    if (script) {
      id = script.src
    }
    else {
      log("Failed to derive: " + factory)

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the uri
    }
  }

  // Parse dependencies according to the module factory code
  if (!isArray(deps) && isFunction(factory)) {
    deps = parseDependencies(factory.toString())
  }

  var meta = { id: id, deps: deps, factory: factory }

  id ? save(resolve(id), meta) :
      // Save information for "saving" work in the script onload event
      anonymousModuleMeta = meta
}

function save(uri, meta) {
  var mod = getModule(uri)

  // Do NOT override already saved modules
  if (mod.status < STATUS.SAVED) {
    // Let the id of anonymous module equal to its uri
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
    return exec(cachedModules[resolveInThisContext(id)])
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

Module.prototype.destroy = function() {
  var uri = this.uri
  delete cachedModules[uri]
  delete fetchedList[uri]
}


// Helpers

function getModule(uri) {
  return cachedModules[uri] ||
      (cachedModules[uri] = new Module(uri))
}

function getUnloadedUris(uris) {
  var ret = []

  for (var i = 0; i < uris.length; i++) {
    var uri = uris[i]
    if (uri && getModule(uri).status < STATUS.LOADED) {
      ret.push(uri)
    }
  }

  return ret
}

var circularStack = []

function isCircularWaiting(mod) {
  var waitings = waitingsList[mod.uri] || []
  if (waitings.length === 0) {
    return false
  }

  circularStack.push(mod.uri)
  if (isOverlap(waitings, circularStack)) {
    cutWaitings(waitings)
    return true
  }

  for (var i = 0; i < waitings.length; i++) {
    if (isCircularWaiting(cachedModules[waitings[i]])) {
      return true
    }
  }

  circularStack.pop()
  return false
}

function isOverlap(arrA, arrB) {
  for (var i = 0; i < arrA.length; i++) {
    for (var j = 0; j < arrB.length; j++) {
      if (arrB[j] === arrA[i]) {
        return true
      }
    }
  }
  return false
}

function cutWaitings(waitings) {
  var uri = circularStack[0]

  for (var i = waitings.length - 1; i >= 0; i--) {
    if (waitings[i] === uri) {
      waitings.splice(i, 1)
      break
    }
  }
}

function printCircularLog(stack) {
  stack.push(stack[0])
  log("Circular dependencies: " + stack.join(" --> "))
}

function preload(callback) {
  var preloadMods = configData.preload
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

