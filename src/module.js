/**
 * module.js - The core of module loader
 */

var cachedModules = seajs.cache = {}

var STATUS = Module.STATUS = {
  "INITIALIZED": 1, // The module is initialized
  "FETCHING": 2,    // The module file is being fetched now
  "SAVED": 3,       // The module data has been saved to cachedModules
  "LOADED": 4,      // The module and all its dependencies are ready to compile
  "COMPILING": 5,   // The module is being compiled
  "COMPILED": 6     // The module is compiled and `module.exports` is available
}

function Module(uri, status) {
  this.uri = uri
  this.status = status || STATUS.INITIALIZED
  this.dependencies = []
  this.waitings = []

  emit("initialized", this)
}

Module.prototype.load = function(ids, callback) {
  var uris = resolve(isArray(ids) ? ids : [ids], this.uri)

  load(uris, function() {
    var exports = []

    for (var i = 0; i < uris.length; i++) {
      exports[i] = compile(cachedModules[uris[i]])
    }

    if (callback) {
      callback.apply(global, exports)
    }
  })
}

function resolve(ids, refUri) {
  if (isArray(ids)) {
    // Use `for` loop instead of `forEach` or `map` function for performance
    var ret = []
    for (var i = 0; i < ids.length; i++) {
      ret[i] = resolve(ids[i], refUri)
    }
    return ret
  }

  var data = { id: ids, refUri: refUri }
  var id = emitData("resolve", data, "id")

  return data.uri || id2Uri(id, refUri)
}

function load(uris, callback, options) {
  options = options || {}
  var unloadedUris = options.filtered ? uris : getUnloadedUris(uris)

  if (unloadedUris.length === 0) {
    callback()
    return
  }

  // Emit load event for plugins such as combo plugin
  emit("load", unloadedUris)

  var len = unloadedUris.length
  var remain = len

  for (var i = 0; i < len; i++) {
    (function(uri) {
      var mod = cachedModules[uri]
      var deps = mod.dependencies

      mod.status < STATUS.SAVED ?
          (deps.length ?
              // Load dependencies that added during module initialization
              mod.load(deps.splice(0, deps.length), function() {
                fetch(uri, onFetched)
              }) :
              fetch(uri, onFetched) ) :
          onFetched()

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
        var waitings = mod.waitings = getUnloadedUris(mod.dependencies)
        if (waitings.length === 0) {
          done(mod)
          return
        }

        // Copy waitings to prevent modification
        load(waitings.slice(), function() {
          done(mod)
        }, { filtered: true })
      }

    })(unloadedUris[i])
  }

  function done(mod) {
    if (mod && mod.status < STATUS.LOADED) {
      mod.status = STATUS.LOADED
    }

    if (--remain === 0) {
      callback()
    }
  }
}

var fetchingList = {}
var fetchedList = {}
var callbackList = {}
var anonymousModuleMeta = null

function fetch(uri, callback) {
  cachedModules[uri].status = STATUS.FETCHING

  // Emit `fetch` event. Plugins could use this event to
  // modify uri or do other magic things
  var requestUri = emitData("fetch",
      { uri: uri, fetchedList: fetchedList },
      "requestUri") || uri

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

  // Emit `request` event and send request
  var charset = configData.charset
  var data = {
    uri: uri,
    requestUri: requestUri,
    callback: onRequested,
    charset: charset
  }
  var requested = emitData("request", data, "requested")

  if (!requested) {
    request(data.requestUri, onRequested, charset)
  }

  function onRequested() {
    delete fetchingList[requestUri]
    fetchedList[requestUri] = true

    // Save meta data of anonymous module
    if (anonymousModuleMeta) {
      save(uri, anonymousModuleMeta)
      anonymousModuleMeta = null
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

  // Parse dependencies according to the module factory code
  if (!isArray(deps) && isFunction(factory)) {
    deps = parseDependencies(factory.toString())
  }

  var meta = { id: id, dependencies: deps, factory: factory }
  var derivedUri

  // Try to derive uri in IE6-9 for anonymous modules
  if (!id && doc.attachEvent) {
    var script = getCurrentScript()

    if (script) {
      derivedUri = script.src
    }
    else {
      log("Failed to derive: " + factory)

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the uri
    }
  }

  var resolvedUri = id ? resolve(id) : derivedUri

  if (resolvedUri) {
    save(resolvedUri, meta)
  }
  else {
    // Save information for "memoizing" work in the script onload event
    anonymousModuleMeta = meta
  }

}

function save(uri, meta) {
  meta.uri = uri
  uri = emitData("save", meta, "uri")

  var mod = getModule(uri)

  // Do NOT override already saved modules
  if (mod.status < STATUS.SAVED) {
    // Let anonymous module id equal to its uri
    mod.id = meta.id || uri

    // Remove duplicated dependencies
    mod.dependencies = resolve(meta.dependencies || [], uri)

    mod.factory = meta.factory
    mod.status = STATUS.SAVED
  }
}

function compile(mod) {
  // Return null when mod is invalid
  if (!mod) {
    return null
  }

  // When module is compiled, DO NOT compile it again. When module
  // is being compiled, just return `module.exports` too, for avoiding
  // circularly calling
  if (mod.status >= STATUS.COMPILING) {
    return mod.exports
  }

  emit("compile", mod)

  // Just return `null` when:
  //  1. the module file is 404
  //  2. the module file is not written with valid module format
  //  3. other error cases
  if (mod.status < STATUS.LOADED && mod.exports === undefined) {
    return null
  }

  mod.status = STATUS.COMPILING


  function require(id) {
    var child = cachedModules[require.resolve(id)]

    // Return `null` when `uri` is invalid
    if (child === undefined) {
      return null
    }

    child.parent = mod
    return compile(child)
  }

  require.async = function(ids, callback) {
    mod.load(ids, callback)
    return require
  }

  require.resolve = function(id) {
    return resolve(id, mod.uri)
  }


  var factory = mod.factory
  var exports = factory === undefined ? mod.exports : factory

  if (isFunction(factory)) {
    exports = factory(require, mod.exports = {}, mod)
  }

  mod.exports = exports === undefined ? mod.exports : exports
  mod.status = STATUS.COMPILED

  emit("compiled", mod)
  return mod.exports
}


// Helpers

function getModule(uri, status) {
  return cachedModules[uri] ||
      (cachedModules[uri] = new Module(uri, status))
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
  var waitings = mod.waitings
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
    // Use splice method to copy array and empty configData.preload
    globalModule.load(preloadMods.splice(0, len), function() {
      // Allow preload modules to add new preload modules
      preload(callback)
    })
  }
  else {
    callback()
  }
}


// Public API

var globalModule = new Module(undefined, STATUS.COMPILED)

seajs.use = function(ids, callback) {
  // Load preload modules before all other modules
  preload(function() {
    globalModule.load(ids, callback)
  })
  return seajs
}

global.define = define
seajs.resolve = id2Uri


