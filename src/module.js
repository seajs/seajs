/**
 * The core of loader
 */

var cachedModules = {}
var compilingStack = []

var STATUS = {
  'LOADING': 1,   // The module file is loading.
  'SAVED': 2,     // The module has been saved to cachedModules.
  'LOADED': 3,    // The module and all its dependencies are ready to compile.
  'COMPILING': 4, // The module is being compiled.
  'COMPILED': 5   // The module is compiled and module.exports is available.
}


function Module(uri, status) {
  this.uri = uri
  this.status = status || STATUS.LOADING
  this.dependencies = []
  this.waitings = []
}


Module.prototype.use = function(ids, callback) {
  isString(ids) && (ids = [ids])
  var uris = resolve(ids, this.uri)

  this.load(uris, function() {
    // Loads preload files introduced in modules before compiling.
    preload(function() {
      var args = map(uris, function(uri) {
        return uri ? cachedModules[uri].compile() : null
      })

      if (callback) {
        callback.apply(null, args)
      }
    })
  })
}


Module.prototype.load = function(uris, callback, options) {
  options = options || {}
  var unloadedUris = options.filtered ? uris : getUnloadedUris(uris)
  var length = unloadedUris.length

  if (length === 0) {
    callback()
    return
  }

  // Emits load event.
  seajs.emit('load', unloadedUris)

  var remain = length
  for (var i = 0; i < length; i++) {
    (function(uri) {
      var mod = getModule(uri)
      mod.status < STATUS.SAVED ? fetch(uri, onFetched) : onFetched()

      function onFetched() {
        // Maybe failed to fetch successfully, such as 404 or non-module.
        // In these cases, just call cb function directly.
        if (mod.status < STATUS.SAVED) {
          return cb()
        }

        // Breaks circular waiting callbacks.
        if (isCircularWaiting(mod)) {
          printCircularLog(circularStack)
          circularStack.length = 0
          cb(mod)
        }

        var waitings = mod.waitings = getUnloadedUris(mod.dependencies)
        if (waitings.length === 0) {
          return cb(mod)
        }

        Module.prototype.load(waitings, function() {
          cb(mod)
        }, { filtered: true })
      }

    })(unloadedUris[i])
  }

  function cb(mod) {
    if (mod && mod.status < STATUS.LOADED) {
      mod.status = STATUS.LOADED
    }
    --remain === 0 && callback()
  }
}


Module.prototype.compile = function() {
  var mod = this
  if (mod.status === STATUS.COMPILED) {
    return mod.exports
  }

  seajs.emit('compile', mod)

  // Just return null when:
  //  1. the module file is 404.
  //  2. the module file is not written with valid module format.
  //  3. other error cases.
  if (mod.status < STATUS.SAVED && !mod.exports) {
    return null
  }

  compilingStack.push(mod)
  mod.status = STATUS.COMPILING


  function require(id) {
    var uri = resolve(id, mod.uri)
    var child = cachedModules[uri]

    // Just return null when uri is invalid.
    if (!child) {
      return null
    }

    // Avoids circular calls.
    if (child.status === STATUS.COMPILING) {
      return child.exports
    }

    child.parent = mod
    return child.compile()
  }

  require.async = function(ids, callback) {
    mod.use(ids, callback)
  }

  require.resolve = function(id) {
    return resolve(id, mod.uri)
  }

  require.cache = cachedModules


  mod.require = require
  mod.exports = mod.exports || {}
  var factory = mod.factory
  var ret = factory

  if (isFunction(factory)) {
    ret = factory(mod.require, mod.exports, mod)
  }

  if (ret !== undefined) {
    mod.exports = ret
  }

  mod.status = STATUS.COMPILED
  compilingStack.pop()

  seajs.emit('compiled', mod)
  return mod.exports
}


function resolve(ids, refUri) {
  if (isString(ids)) {
    var id = seajs.emitData('resolve', { id: ids, refUri: refUri }, 'id')
    return id2Uri(id, refUri)
  }

  return map(ids, function(id) {
    return resolve(id, refUri)
  })
}


function fetch(uri, callback) {
  // Emits `fetch` event, firing all bound callbacks, and gets
  // the modified uri.
  var requestUri = seajs.emitData('fetch', { uri: uri })

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


  // Sends request.
  var charset = config.charset

  var requested = seajs.emitData('request', {
    uri: requestUri,
    callback: finish,
    charset: charset
  }, 'requested')

  !requested && request(requestUri, finish, charset)


  function finish() {
    delete fetchingList[requestUri]
    fetchedList[requestUri] = true

    // Saves anonymous module
    if (anonymousModuleMeta) {
      save(uri, anonymousModuleMeta)
      anonymousModuleMeta = null
    }

    // Calls callbacks
    var fn, fns = callbackList[requestUri]
    delete callbackList[requestUri]
    while ((fn = fns.shift())) fn()
  }

}


function define(id, deps, factory) {
  var argsLength = arguments.length

  // define(factory)
  if (argsLength === 1) {
    factory = id
    id = undefined
  }
  // define(id || deps, factory)
  else if (argsLength === 2) {
    factory = deps
    deps = undefined

    // define(deps, factory)
    if (isArray(id)) {
      deps = id
      id = undefined
    }
  }

  // Parses dependencies according to the module code.
  if (!isArray(deps) && isFunction(factory)) {
    deps = parseDependencies(factory.toString())
  }

  var meta = { id: id, dependencies: deps, factory: factory }
  var derivedUri

  // Try to derive uri in IE6-9 for anonymous modules.
  if (!id && document.attachEvent) {
    var script = getCurrentScript()

    if (script && script.src) {
      derivedUri = getScriptAbsoluteSrc(script)
      derivedUri = seajs.emitData('derived', { uri: derivedUri })
    }
    else {
      log('Failed to derive URI from interactive script for:',
          factory.toString(), 'warn')

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the uri.
    }
  }

  var resolvedUri = id ? resolve(id) : derivedUri

  if (resolvedUri) {
    save(resolvedUri, meta)
  }
  else {
    // Saves information for "memoizing" work in the script onload event.
    anonymousModuleMeta = meta
  }

}


function save(uri, meta) {
  var mod = cachedModules[uri] || (cachedModules[uri] = new Module(uri))

  // Don't override already saved module
  if (mod.status < STATUS.SAVED) {
    // Lets anonymous module id equal to its uri
    mod.id = meta.id || uri

    mod.dependencies = resolve(
        filter(meta.dependencies || [], function(dep) {
          return !!dep
        }), uri)

    mod.factory = meta.factory

    // Updates module status
    mod.status = STATUS.SAVED
  }

  return mod
}


function preload(callback) {
  var preloadMods = config.preload.slice()
  config.preload = []
  preloadMods.length ? globalModule.use(preloadMods, callback) : callback()
}


// Helpers
// -------

var fetchingList = {}
var fetchedList = {}
var callbackList = {}
var anonymousModuleMeta = null
var circularStack = []

function getModule(uri, status) {
  return cachedModules[uri] ||
      (cachedModules[uri] = new Module(uri, status))
}

function getUnloadedUris(uris) {
  return filter(uris, function(uri) {
    return !cachedModules[uri] || cachedModules[uri].status < STATUS.LOADED
  })
}

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
// ----------

var globalModule = new Module(pageUri, STATUS.COMPILED)

seajs.use = function(ids, callback) {
  // Loads preload modules before all other modules.
  preload(function() {
    globalModule.use(ids, callback)
  })
  return seajs
}

seajs.cache = cachedModules

