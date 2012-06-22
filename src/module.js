/**
 * The Module constructor and its methods
 */
;(function(seajs, util, config) {

  var cachedModules = {}
  var cachedModifiers = {}

  var STATUS = {
    'FETCHED': 0,  // The module file has been downloaded to the browser.
    'SAVED': 1,    // The module info including uri has been saved.
    'LOADED': 2,   // All dependencies are loaded.
    'COMPILED': 3  // The module.exports is available.
  }


  /**
   * The Module constructor
   * @constructor
   */
  function Module(id, deps, factory) {
    this.id = id
    this.dependencies = deps || []
    this.factory = factory
    this.status = 0

    // this.uri is set when saving
    // this.exports is set when compiling
    // this.parent is set when compiling
  }


  Module.prototype._use = function(ids, callback) {
    util.isString(ids) && (ids = [ids])
    var uris = resolve(ids, this.uri)

    this._load(uris, function() {
      var args = util.map(uris, function(uri) {
        var module = cachedModules[uri]
        return module ? module._compile() : null
      })

      if (callback) {
        callback.apply(null, args)
      }
    })
  }


  Module.prototype._load = function(uris, callback) {
    var unLoadedUris = util.filter(uris, function(uri) {
      return uri && (!cachedModules[uri] ||
          cachedModules[uri].status < STATUS.LOADED)
    })

    if (unLoadedUris.length === 0) {
      callback()
      return
    }

    var length = unLoadedUris.length
    var remain = length

    for (var i = 0; i < length; i++) {
      (function(uri) {
        cachedModules[uri] ? onFetch() : fetch(uri, onFetch)

        function onFetch() {
          var module = cachedModules[uri]

          if (module) {
            var deps = getPureDependencies(module)

            if (deps.length) {
              Module.prototype._load(deps, function() {
                cb(module)
              })
            }
            else {
              cb(module)
            }
          }
          // Maybe failed to fetch successfully, such as 404 error.
          else {
            cb()
          }
        }

      })(unLoadedUris[i])
    }

    /**
     * @param {Object=} module
     */
    function cb(module) {
      module && (module.status = STATUS.LOADED)
      --remain === 0 && callback()
    }
  }


  Module.prototype._compile = function() {
    var module = this
    if (module.exports) {
      return module.exports
    }


    function require(id) {
      var uri = resolve(id, module.uri)
      var child = cachedModules[uri]

      // Just return null when:
      //  1. the module file is 404.
      //  2. the module file is not written with valid module format.
      //  3. other error cases.
      if (!child) {
        return null
      }

      if (isCircular(child)) {
        return child.exports
      }

      child.parent = module
      return child._compile()
    }

    require.async = function(ids, callback) {
      module._use(ids, callback)
    }

    require.resolve = function(id) {
      return resolve(id, module.uri)
    }

    require.cache = cachedModules


    module.require = require
    module.exports = {}
    var factory = module.factory

    if (util.isFunction(factory)) {
      runInModuleContext(factory, module)
    }
    else if (factory !== undefined) {
      module.exports = factory
    }

    module.status = STATUS.COMPILED
    execModifiers(module)
    return module.exports
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

    // Parses dependencies.
    if (!util.isArray(deps) && util.isFunction(factory)) {
      deps = util.parseDependencies(factory.toString())
    }

    // Gets url directly for specific modules.
    if (id) {
      var uri = resolve(id)
    }
    // Try to derive url in IE6-9 for anonymous modules.
    else if (document.attachEvent) {

      // Try to get the current script.
      var script = util.getCurrentScript()
      if (script) {
        uri = util.unParseMap(util.getScriptAbsoluteSrc(script))
      }

      if (!uri) {
        util.log('** Failed to derive URI from interactive script for:',
            factory.toString())

        // NOTE: If the id-deriving methods above is failed, then falls back
        // to use onload event to get the url.
      }
    }

    var module = new Module(id, deps, factory)

    if (uri) {
      save(uri, module)
      currentPackageModules.push(module)
    }
    else {
      // Saves information for "memoizing" work in the onload event.
      anonymousModule = module
    }

  }


  // For plugin developers
  Module._resolve = util.id2Uri
  Module._fetch = util.fetch
  Module._cache = cachedModules


  // Helpers
  // -------

  var fetchingList = {}
  var fetchedList = {}
  var callbackList = {}
  var anonymousModule = null
  var currentPackageModules = []

  /**
   * @param {string=} refUri
   */
  function resolve(ids, refUri) {
    if (util.isString(ids)) {
      return Module._resolve(ids, refUri)
    }

    return util.map(ids, function(id) {
      return resolve(id, refUri)
    })
  }

  function fetch(uri, callback) {
    var srcUrl = util.parseMap(uri)

    if (fetchedList[srcUrl]) {
      callback()
      return
    }

    if (fetchingList[srcUrl]) {
      callbackList[srcUrl].push(callback)
      return
    }

    fetchingList[srcUrl] = true
    callbackList[srcUrl] = [callback]

    Module._fetch(
        srcUrl,

        function() {
          fetchedList[srcUrl] = true

          // Saves anonymous module.
          var module = anonymousModule
          if (module) {
            save(uri, module)
            anonymousModule = null
          }

          // Assigns the first module in package to cachedModules[uri]
          // See: test/issues/un-correspondence
          module = currentPackageModules[0]
          if (module && !cachedModules[uri]) {
            cachedModules[uri] = module
          }
          currentPackageModules = []

          // Clears
          if (fetchingList[srcUrl]) {
            delete fetchingList[srcUrl]
          }

          // Calls callbackList
          if (callbackList[srcUrl]) {
            util.forEach(callbackList[srcUrl], function(fn) {
              fn()
            })
            delete callbackList[srcUrl]
          }

        },

        config.charset
    )
  }

  function save(uri, module) {
    // Don't override existed module.
    if (!cachedModules[uri]) {
      module.uri = uri

      // Lets anonymous module id equal to its uri.
      if (!module.id) {
        module.id = uri
      }

      module.dependencies = resolve(
          util.filter(module.dependencies, function(dep) {
            return !!dep
          }), uri)

      module.status = STATUS.SAVED
      cachedModules[uri] = module
    }
  }

  function runInModuleContext(fn, module) {
    var ret = fn(module.require, module.exports, module)
    if (ret !== undefined) {
      module.exports = ret
    }
  }

  function execModifiers(module) {
    var uri = module.uri
    var modifiers = cachedModifiers[uri]

    if (modifiers) {
      util.forEach(modifiers, function(modifier) {
        runInModuleContext(modifier, module)
      })

      delete cachedModifiers[uri]
    }
  }


  function getPureDependencies(module) {
    var uri = module.uri
    return util.filter(module.dependencies, function(dep) {
      return !isCircularWaiting(cachedModules[dep], uri)
    })
  }

  function isCircularWaiting(module, uri) {
    if (!module || module.status >= STATUS.LOADED) {
      return false
    }

    var deps = module.dependencies

    if (deps.length) {
      if (util.indexOf(deps, uri) > -1) {
        return true
      }

      for (var i = 0; i < deps.length; i++) {
        if (isCircularWaiting(cachedModules[deps[i]], uri)) {
          return true
        }
      }

      return false
    }

    return false
  }

  function isCircular(module) {
    var ret = false
    var stack = [module.uri]
    var parent = module

    while (parent = parent.parent) {
      stack.unshift(parent.uri)

      if (parent === module) {
        ret = true
        break
      }
    }

    if (ret) {
      util.log('** Found circular dependencies:', stack.join(' --> '))
    }

    return ret
  }


  // Public API
  // ----------

  var globalModule = new Module(util.pageUrl, [], {})

  /**
   * Loads modules to the environment and executes in callback.
   * @param {function()=} callback
   */
  seajs.use = function(ids, callback) {
    var preloadMods = config.preload

    if (preloadMods.length) {
      // Loads preload modules before all other modules.
      globalModule._use(preloadMods, function() {
        config.preload = []
        globalModule._use(ids, callback)
      })
    }
    else {
      globalModule._use(ids, callback)
    }

    return seajs
  }


  /**
   * Modifies the exports of a module.
   */
  seajs.modify = function(id, modifier) {
    var uri = resolve(id)
    var module = cachedModules[uri]

    if (module && module.status === STATUS.COMPILED) {
      runInModuleContext(modifier, module)
    }
    else {
      cachedModifiers[uri] || (cachedModifiers[uri] = [])
      cachedModifiers[uri].push(modifier)
    }

    return seajs
  }


  // For bootstrap
  seajs.define = Module._define

  // For plugin developers
  seajs.pluginSDK = {
    Module: Module,
    util: util,
    config: config
  }

})(seajs, seajs._util, seajs._config)

