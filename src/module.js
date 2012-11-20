/**
 * The core of loader
 */
;(function(seajs, util, config) {

  var cachedModules = {}
  var cachedModifiers = {}
  var compileStack = []

  var STATUS = {
    'FETCHING': 1,  // The module file is fetching now.
    'FETCHED': 2,   // The module file has been fetched.
    'SAVED': 3,     // The module info has been saved.
    'READY': 4,     // All dependencies and self are ready to compile.
    'COMPILING': 5, // The module is in compiling now.
    'COMPILED': 6   // The module is compiled and module.exports is available.
  }


  function Module(uri, status) {
    this.uri = uri
    this.status = status || 0

    // this.id is set when saving
    // this.dependencies is set when saving
    // this.factory is set when saving
    // this.exports is set when compiling
    // this.parent is set when compiling
    // this.require is set when compiling
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


  Module.prototype._load = function(uris, callback) {
    var unLoadedUris = util.filter(uris, function(uri) {
      return uri && (!cachedModules[uri] ||
          cachedModules[uri].status < STATUS.READY)
    })

    var length = unLoadedUris.length
    if (length === 0) {
      callback()
      return
    }

    var remain = length

    for (var i = 0; i < length; i++) {
      (function(uri) {
        var module = cachedModules[uri] ||
            (cachedModules[uri] = new Module(uri, STATUS.FETCHING))

        module.status >= STATUS.FETCHED ? onFetched() : fetch(uri, onFetched)

        function onFetched() {
          // cachedModules[uri] is changed in un-correspondence case
          module = cachedModules[uri]

          if (module.status >= STATUS.SAVED) {
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
          // Maybe failed to fetch successfully, such as 404 or non-module.
          // In these cases, just call cb function directly.
          else {
            cb()
          }
        }

      })(unLoadedUris[i])
    }

    function cb(module) {
      (module || {}).status < STATUS.READY && (module.status = STATUS.READY)
      --remain === 0 && callback()
    }
  }


  Module.prototype._compile = function() {
    var module = this
    if (module.status === STATUS.COMPILED) {
      return module.exports
    }

    // Just return null when:
    //  1. the module file is 404.
    //  2. the module file is not written with valid module format.
    //  3. other error cases.
    if (module.status < STATUS.SAVED && !hasModifiers(module)) {
      return null
    }

    module.status = STATUS.COMPILING


    function require(id) {
      var uri = resolve(id, module.uri)
      var child = cachedModules[uri]

      // Just return null when uri is invalid.
      if (!child) {
        return null
      }

      // Avoids circular calls.
      if (child.status === STATUS.COMPILING) {
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
      compileStack.push(module)
      runInModuleContext(factory, module)
      compileStack.pop()
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

    var meta = { id: id, dependencies: deps, factory: factory }
    var derivedUri

    // Try to derive uri in IE6-9 for anonymous modules.
    if (document.attachEvent) {
      // Try to get the current script.
      var script = util.getCurrentScript()
      if (script) {
        derivedUri = util.unParseMap(util.getScriptAbsoluteSrc(script))
      }

      if (!derivedUri) {
        util.log('Failed to derive URI from interactive script for:',
            factory.toString(), 'warn')

        // NOTE: If the id-deriving methods above is failed, then falls back
        // to use onload event to get the uri.
      }
    }

    // Gets uri directly for specific module.
    var resolvedUri = id ? resolve(id) : derivedUri

    if (resolvedUri) {
      // For IE:
      // If the first module in a package is not the cachedModules[derivedUri]
      // self, it should assign to the correct module when found.
      if (resolvedUri === derivedUri) {
        var refModule = cachedModules[derivedUri]
        if (refModule && refModule.realUri &&
            refModule.status === STATUS.SAVED) {
          cachedModules[derivedUri] = null
        }
      }

      var module = Module._save(resolvedUri, meta)

      // For IE:
      // Assigns the first module in package to cachedModules[derivedUrl]
      if (derivedUri) {
        // cachedModules[derivedUri] may be undefined in combo case.
        if ((cachedModules[derivedUri] || {}).status === STATUS.FETCHING) {
          cachedModules[derivedUri] = module
          module.realUri = derivedUri
        }
      }
      else {
        firstModuleInPackage || (firstModuleInPackage = module)
      }
    }
    else {
      // Saves information for "memoizing" work in the onload event.
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
        var module = cachedModules[uri]
        module.exports && matches.push(module.exports)
      }
    })

    return matches
  }


  Module._modify = function(id, modifier) {
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
  var firstModuleInPackage = null
  var circularCheckStack = []

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

          // Updates module status
          var module = cachedModules[uri]
          if (module.status === STATUS.FETCHING) {
            module.status = STATUS.FETCHED
          }

          // Saves anonymous module meta data
          if (anonymousModuleMeta) {
            Module._save(uri, anonymousModuleMeta)
            anonymousModuleMeta = null
          }

          // Assigns the first module in package to cachedModules[uri]
          // See: tests/issues/un-correspondence
          if (firstModuleInPackage && module.status === STATUS.FETCHED) {
            cachedModules[uri] = firstModuleInPackage
            firstModuleInPackage.realUri = uri
          }
          firstModuleInPackage = null

          // Clears
          if (fetchingList[requestUri]) {
            delete fetchingList[requestUri]
          }

          // Calls callbackList
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
    var module = cachedModules[uri] || (cachedModules[uri] = new Module(uri))

    // Don't override already saved module
    if (module.status < STATUS.SAVED) {
      // Lets anonymous module id equal to its uri
      module.id = meta.id || uri

      module.dependencies = resolve(
          util.filter(meta.dependencies || [], function(dep) {
            return !!dep
          }), uri)

      module.factory = meta.factory

      // Updates module status
      module.status = STATUS.SAVED
    }

    return module
  }

  function runInModuleContext(fn, module) {
    var ret = fn(module.require, module.exports, module)
    if (ret !== undefined) {
      module.exports = ret
    }
  }

  function hasModifiers(module) {
    return !!cachedModifiers[module.realUri || module.uri]
  }

  function execModifiers(module) {
    var uri = module.realUri || module.uri
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
      circularCheckStack = [uri]

      var isCircular = isCircularWaiting(cachedModules[dep])
      if (isCircular) {
        circularCheckStack.push(uri)
        printCircularLog(circularCheckStack)
      }

      return !isCircular
    })
  }

  function isCircularWaiting(module) {
    if (!module || module.status !== STATUS.SAVED) {
      return false
    }

    circularCheckStack.push(module.uri)
    var deps = module.dependencies

    if (deps.length) {
      if (isOverlap(deps, circularCheckStack)) {
        return true
      }

      for (var i = 0; i < deps.length; i++) {
        if (isCircularWaiting(cachedModules[deps[i]])) {
          return true
        }
      }
    }

    circularCheckStack.pop()
    return false
  }

  function printCircularLog(stack, type) {
    util.log('Found circular dependencies:', stack.join(' --> '), type)
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

