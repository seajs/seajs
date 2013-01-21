/**
 * module.js - The core of module loader
 */

var cachedModules = seajs.cache = {}

var STATUS = {
  'LOADING': 1,   // The module file is loading
  'SAVED': 2,     // The module data has been saved to cachedModules
  'LOADED': 3,    // The module and all its dependencies are ready to compile
  'COMPILING': 4, // The module is being compiled
  'COMPILED': 5   // The module is compiled and `module.exports` is available
}

function Module(uri, status) {
  this.uri = uri
  this.status = status || STATUS.LOADING
  this.dependencies = []
  this.waitings = []
}

Module.prototype.load = function(ids, callback) {
  var uris = resolve(isArray(ids) ? ids : [ids], this.uri)

  load(uris, function() {
    var exports = map(uris, function(uri) {
      return compile(cachedModules[uri])
    })

    if (callback) {
      callback.apply(global, exports)
    }
  })
}

function resolve(ids, refUri) {
  if (isArray(ids)) {
    return map(ids, function(id) {
      return resolve(id, refUri)
    })
  }

  var id = ids, uri
  id = emitData('resolve', { id: id, refUri: refUri }, 'id')
  uri = id2Uri(id, refUri)
  uri = emitData('resolved', { uri: uri })
  return uri
}

function load(uris, callback, options) {
  options = options || {}
  var unloadedUris = options.filtered ? uris : getUnloadedUris(uris)

  if (unloadedUris.length === 0) {
    callback()
    return
  }

  // Emit load event for plugins such as combo plugin
  emit('load', unloadedUris)

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
          done(mod)
          return
        }

        // Load all unloaded dependencies
        var waitings = mod.waitings = getUnloadedUris(mod.dependencies)
        if (waitings.length === 0) {
          done(mod)
          return
        }

        load(waitings, function() {
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
  // Emit `fetch` event. Plugins could use this event to
  // modify uri or do other magic things
  var requestUri = emitData('fetch',
      { uri: uri, fetchedList: fetchedList },
      'uri')

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

  // Send request
  var charset = config.charset
  var requested = emitData('request',
      { uri: requestUri, callback: onRequested, charset: charset },
      'requested')

  if (!requested) {
    request(requestUri, onRequested, charset)
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

    if (script && script.src) {
      derivedUri = getScriptAbsoluteSrc(script)
      derivedUri = emitData('derived', { uri: derivedUri })
    }
    else {
      log('Failed to derive URI from interactive script for:',
          factory.toString(), 'warn')

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
  var mod = cachedModules[uri]

  // Do NOT override already saved modules
  if (mod.status < STATUS.SAVED) {
    mod.id = meta.id || uri // Let anonymous module id equal to its uri
    mod.dependencies = resolve(meta.dependencies || [], uri)
    mod.factory = meta.factory

    mod.status = STATUS.SAVED
  }
}

function compile(mod) {
  if (mod.status === STATUS.COMPILED) {
    return mod.exports
  }

  emit('compile', mod)

  // Just return null when:
  //  1. the module file is 404
  //  2. the module file is not written with valid module format
  //  3. other error cases
  if (mod.status < STATUS.LOADED && mod.exports === undefined) {
    return null
  }

  mod.status = STATUS.COMPILING


  function require(id) {
    var uri = resolve(id, mod.uri)
    var child = cachedModules[uri]

    // Just return null when uri is invalid
    if (!child) {
      return null
    }

    // Avoid circularly calling
    if (child.status === STATUS.COMPILING) {
      return child.exports
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

  require.cache = cachedModules


  mod.require = require
  mod.exports = mod.exports || {}
  delete mod.waitings

  var factory = mod.factory
  var exports = factory

  if (isFunction(factory)) {
    exports = factory(mod.require, mod.exports, mod)
  }

  if (exports !== undefined) {
    mod.exports = exports
  }

  mod.status = STATUS.COMPILED
  emit('compiled', mod)

  return mod.exports
}


// Helpers

function createModule(uri, status) {
  return cachedModules[uri] ||
      (cachedModules[uri] = new Module(uri, status))
}

function getUnloadedUris(uris) {
  return filter(uris, function(uri) {
    return createModule(uri).status < STATUS.LOADED
  })
}

var circularStack = []

function isCircularWaiting(mod) {
  var waitings = mod.waitings
  if (waitings.length === 0) {
    return false
  }

  circularStack.push(mod.uri)
  if (isOverlap(waitings, circularStack)) {
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

function printCircularLog(stack) {
  stack.push(stack[0])
  log('Found circular dependencies:', stack.join(' --> '))
}

function isOverlap(arrA, arrB) {
  var arrC = arrA.concat(arrB)
  return arrC.length > unique(arrC).length
}


// Public API

var globalModule = new Module(pageUri, STATUS.COMPILED)
var preloadModules = []

function preload(callback) {
  var len = preloadModules.length
  len ? globalModule.load(preloadModules.splice(0, len), callback) :
      callback()
}

var use = seajs.use = function(ids, callback) {
  // Load preload modules before all other modules
  preload(function() {
    globalModule.load(ids, callback)
  })
  return seajs
}

global.define = define


