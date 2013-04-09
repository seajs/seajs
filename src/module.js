/**
 * module.js - The core of module loader
 */

var cachedModules = seajs.cache = {}
var anonymousModuleData

var fetchingList = {}
var fetchedList = {}
var callbackList = {}
var waitingsList = {}

// 1 - The module file is being fetched now
// 2 - The module data has been saved to cachedModules
// 3 - The module and all its dependencies are ready to execute
// 4 - The module is being executed
// 5 - The module is executed and `module.exports` is available
var STATUS_FETCHING = 1
var STATUS_SAVED = 2
var STATUS_LOADED = 3
var STATUS_EXECUTING = 4
var STATUS_EXECUTED = 5


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

function use(uris, callback) {
  isArray(uris) || (uris = [uris])

  load(uris, function() {
    var exports = []

    for (var i = 0; i < uris.length; i++) {
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

  var len = unloadedUris.length
  var remain = len

  for (var i = 0; i < len; i++) {
    (function(uri) {
      var mod = cachedModules[uri]

      if (mod.dependencies.length) {
        loadWaitings(function(circular) {
          mod.status < STATUS_SAVED ? fetch(uri, cb) : cb()
          function cb() {
            done(circular)
          }
        })
      }
      else {
        mod.status < STATUS_SAVED ?
            fetch(uri, loadWaitings) : done()
      }

      function loadWaitings(cb) {
        cb || (cb = done)

        var waitings = getUnloadedUris(mod.dependencies)
        if (waitings.length === 0) {
          cb()
        }
        // Break circular waiting callbacks
        else if (isCircularWaiting(mod)) {
          printCircularLog(circularStack)
          circularStack.length = 0
          cb(true)
        }
        // Load all unloaded dependencies
        else {
          waitingsList[uri] = waitings
          load(waitings, cb)
        }
      }

      function done(circular) {
        if (!circular && mod.status < STATUS_LOADED) {
          mod.status = STATUS_LOADED
        }

        if (--remain === 0) {
          callback()
        }
      }

    })(unloadedUris[i])
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
  // define(factory)
  if (arguments.length === 1) {
    factory = id
    id = undefined
  }

  // Parse dependencies according to the module factory code
  if (!isArray(deps) && isFunction(factory)) {
    deps = parseDependencies(factory.toString())
  }

  var data = { id: id, uri: resolve(id), deps: deps, factory: factory }

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
    // Let the id of anonymous module equal to its uri
    mod.id = meta.id || uri

    mod.dependencies = resolve(meta.deps || [], uri)
    mod.factory = meta.factory

    if (mod.factory !== undefined) {
      mod.status = STATUS_SAVED
    }
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

  for (var i = 0; i < uris.length; i++) {
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
  log("Circular dependencies: " + stack.join(" -> "))
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

Module.load = use
seajs.resolve = id2Uri
global.define = define

seajs.require = function(id) {
  return (cachedModules[id2Uri(id)] || {}).exports
}

