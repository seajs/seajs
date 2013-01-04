/**
 * The core of loader
 */
;(function(seajs, util, config) {

  var cachedModules = {}
  var cachedModifiers = {}
  var compileStack = []

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


  Module.prototype._use = function(ids, callback) {
    util.isString(ids) && (ids = [ids])
    var uris = resolve(ids, this.uri)

    this._load(uris, function() {
      // Loads preload files introduced in modules before compiling.
      preload(function() {
        var args = util.map(uris, function(uri) {
          return uri ? cachedModules[uri]._compile() : null
        })

        if (callback) {
          callback.apply(null, args)
        }
      })
    })
  }


  Module.prototype._load = function(uris, callback, options) {
    options = options || {}
    var unloadedUris = options.filtered ? uris : getUnloadedUris(uris)
    var length = unloadedUris.length

    if (length === 0) {
      callback()
      return
    }

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

          Module.prototype._load(waitings, function() {
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


  Module.prototype._compile = function() {
    var mod = this
    if (mod.status === STATUS.COMPILED) {
      return mod.exports
    }

    // Just return null when:
    //  1. the module file is 404.
    //  2. the module file is not written with valid module format.
    //  3. other error cases.
    if (mod.status < STATUS.SAVED && !hasModifiers(mod)) {
      return null
    }

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
      return child._compile()
    }

    require.async = function(ids, callback) {
      mod._use(ids, callback)
    }

    require.resolve = function(id) {
      return resolve(id, mod.uri)
    }

    require.cache = cachedModules


    mod.require = require
    mod.exports = {}
    var factory = mod.factory

    if (util.isFunction(factory)) {
      compileStack.push(mod)
      runInModuleContext(factory, mod)
      compileStack.pop()
    }
    else if (factory !== undefined) {
      mod.exports = factory
    }

    mod.status = STATUS.COMPILED
    execModifiers(mod)
    return mod.exports
  }


  Module._define = function(id, deps, factory) {
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
      if (util.isArray(id)) {
        deps = id
        id = undefined
      }
    }

    // Parses dependencies according to the module code.
    if (!util.isArray(deps) && util.isFunction(factory)) {
      deps = util.parseDependencies(factory.toString())
    }

    var meta = { id: id, dependencies: deps, factory: factory }
    var derivedUri

    // Try to derive uri in IE6-9 for anonymous modules.
    if (!id && document.attachEvent) {
      var script = util.getCurrentScript()

      if (script && script.src) {
        derivedUri = util.unParseMap(util.getScriptAbsoluteSrc(script))
      }
      else {
        util.log('Failed to derive URI from interactive script for:',
            factory.toString(), 'warn')

        // NOTE: If the id-deriving methods above is failed, then falls back
        // to use onload event to get the uri.
      }
    }

    var resolvedUri = id ? resolve(id) : derivedUri

    if (resolvedUri) {
      Module._save(resolvedUri, meta)
    }
    else {
      // Saves information for "memoizing" work in the script onload event.
      anonymousModuleMeta = meta
    }

  }


  Module._getCompilingModule = function() {
    return compileStack[compileStack.length - 1]
  }


  Module._find = function(selector) {
    var matches = []

    util.forEach(util.keys(cachedModules), function(uri) {
      if (util.isString(selector) && uri.indexOf(selector) > -1 ||
          util.isRegExp(selector) && selector.test(uri)) {
        var mod = cachedModules[uri]
        mod.exports && matches.push(mod.exports)
      }
    })

    return matches
  }


  Module._modify = function(id, modifier) {
    var uri = resolve(id)
    var mod = cachedModules[uri]

    if (mod && mod.status === STATUS.COMPILED) {
      runInModuleContext(modifier, mod)
    }
    else {
      cachedModifiers[uri] || (cachedModifiers[uri] = [])
      cachedModifiers[uri].push(modifier)
    }

    return seajs
  }


  // For plugin developers
  Module.STATUS = STATUS
  Module._resolve = util.id2Uri
  Module._fetch = util.fetch
  Module._save = save


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

  function resolve(ids, refUri) {
    if (util.isString(ids)) {
      return Module._resolve(ids, refUri)
    }

    return util.map(ids, function(id) {
      return resolve(id, refUri)
    })
  }

  function fetch(uri, callback) {
    var requestUri = util.parseMap(uri)

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

    // Fetches it
    Module._fetch(
        requestUri,

        function() {
          fetchedList[requestUri] = true
          delete fetchingList[requestUri]

          // Saves anonymous module
          if (anonymousModuleMeta) {
            Module._save(uri, anonymousModuleMeta)
            anonymousModuleMeta = null
          }

          // Calls callbacks
          var fns = callbackList[requestUri]
          if (fns) {
            delete callbackList[requestUri]
            util.forEach(fns, function(fn) {
              fn()
            })
          }

        },

        config.charset
    )
  }

  function save(uri, meta) {
    var mod = cachedModules[uri] || (cachedModules[uri] = new Module(uri))

    // Don't override already saved module
    if (mod.status < STATUS.SAVED) {
      // Lets anonymous module id equal to its uri
      mod.id = meta.id || uri

      mod.dependencies = resolve(
          util.filter(meta.dependencies || [], function(dep) {
            return !!dep
          }), uri)

      mod.factory = meta.factory

      // Updates module status
      mod.status = STATUS.SAVED
    }

    return mod
  }

  function runInModuleContext(fn, mod) {
    var ret = fn(mod.require, mod.exports, mod)
    if (ret !== undefined) {
      mod.exports = ret
    }
  }

  function hasModifiers(mod) {
    return !!cachedModifiers[mod.realUri || mod.uri]
  }

  function execModifiers(mod) {
    var uri = mod.realUri || mod.uri
    var modifiers = cachedModifiers[uri]

    if (modifiers) {
      util.forEach(modifiers, function(modifier) {
        runInModuleContext(modifier, mod)
      })

      delete cachedModifiers[uri]
    }
  }

  function getUnloadedUris(uris) {
    return util.filter(uris, function(uri) {
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
    util.log('Found circular dependencies:', stack.join(' --> '))
  }

  function isOverlap(arrA, arrB) {
    var arrC = arrA.concat(arrB)
    return arrC.length > util.unique(arrC).length
  }

  function preload(callback) {
    var preloadMods = config.preload.slice()
    config.preload = []
    preloadMods.length ? globalModule._use(preloadMods, callback) : callback()
  }


  // Public API
  // ----------

  var globalModule = new Module(util.pageUri, STATUS.COMPILED)

  seajs.use = function(ids, callback) {
    // Loads preload modules before all other modules.
    preload(function() {
      globalModule._use(ids, callback)
    })

    // Chain
    return seajs
  }


  // For normal users
  seajs.define = Module._define
  seajs.cache = Module.cache = cachedModules
  seajs.find = Module._find
  seajs.modify = Module._modify


  // For plugin developers
  Module.fetchedList = fetchedList
  seajs.pluginSDK = {
    Module: Module,
    util: util,
    config: config
  }

})(seajs, seajs._util, seajs._config)

