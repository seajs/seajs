/**
 * @preserve SeaJS - A Module Loader for the Web
 * v2.0.0-dev | seajs.org | MIT Licensed
 */


/**
 * Base namespace for the framework.
 */
this.seajs = { _seajs: this.seajs }


/**
 * The version of the framework. It will be replaced with "major.minor.patch"
 * when building.
 */
seajs.version = '2.0.0-dev'


/**
 * The private utilities. Internal use only.
 */
seajs._util = {}


/**
 * The private configuration data. Internal use only.
 */
seajs._config = {

  /**
   * Debug mode. It will be turned off automatically when compressing.
   */
  debug: '%DEBUG%',

  /**
   * Modules that are needed to load before all other modules.
   */
  preload: []
}

/**
 * The minimal language enhancement
 */
;(function(util) {

  var toString = Object.prototype.toString
  var AP = Array.prototype


  util.isString = function(val) {
    return toString.call(val) === '[object String]'
  }


  util.isFunction = function(val) {
    return toString.call(val) === '[object Function]'
  }


  util.isRegExp = function(val) {
    return toString.call(val) === '[object RegExp]'
  }


  util.isObject = function(val) {
    return val === Object(val)
  }


  util.isArray = Array.isArray || function(val) {
    return toString.call(val) === '[object Array]'
  }


  util.indexOf = AP.indexOf ?
      function(arr, item) {
        return arr.indexOf(item)
      } :
      function(arr, item) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] === item) {
            return i
          }
        }
        return -1
      }


  var forEach = util.forEach = AP.forEach ?
      function(arr, fn) {
        arr.forEach(fn)
      } :
      function(arr, fn) {
        for (var i = 0; i < arr.length; i++) {
          fn(arr[i], i, arr)
        }
      }


  util.map = AP.map ?
      function(arr, fn) {
        return arr.map(fn)
      } :
      function(arr, fn) {
        var ret = []
        forEach(arr, function(item, i, arr) {
          ret.push(fn(item, i, arr))
        })
        return ret
      }


  util.filter = AP.filter ?
      function(arr, fn) {
        return arr.filter(fn)
      } :
      function(arr, fn) {
        var ret = []
        forEach(arr, function(item, i, arr) {
          if (fn(item, i, arr)) {
            ret.push(item)
          }
        })
        return ret
      }


  var keys = util.keys = Object.keys || function(o) {
    var ret = []

    for (var p in o) {
      if (o.hasOwnProperty(p)) {
        ret.push(p)
      }
    }

    return ret
  }


  util.unique = function(arr) {
    var o = {}

    forEach(arr, function(item) {
      o[item] = 1
    })

    return keys(o)
  }

})(seajs._util)

/**
 * The tiny console
 */
;(function(util) {

  /**
   * The safe wrapper of console.log/error/...
   */
  util.log = function() {
    if (typeof console === 'undefined') return

    var args = Array.prototype.slice.call(arguments)

    var type = 'log'
    var last = args[args.length - 1]
    console[last] && (type = args.pop())

    // Only show log info in debug mode
    if (type === 'log' && !seajs.debug) return

    if (console[type].apply) {
      console[type].apply(console, args)
      return
    }

    // See issue#349
    var length = args.length
    if (length === 1) {
      console[type](args[0])
    }
    else if (length === 2) {
      console[type](args[0], args[1])
    }
    else if (length === 3) {
      console[type](args[0], args[1], args[2])
    }
    else {
      console[type](args.join(' '))
    }
  }

})(seajs._util)

/**
 * Path utilities
 */
;(function(util, config, global) {

  var DIRNAME_RE = /[^?]*(?=\/.*$)/
  var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g
  var FILE_EXT_RE = /\.(?:css|js)$/
  var ROOT_RE = /^(.*?\w)(?:\/|$)/
  var VARS_RE = /\{\{([^{}]+)\}\}/g


  /**
   * Extracts the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b/'
   * dirname('d.js') ==> './'
   * @see http://jsperf.com/regex-vs-split/2
   */
  function dirname(path) {
    var s = path.match(DIRNAME_RE)
    return (s ? s[0] : '.') + '/'
  }


  /**
   * Canonicalizes a path.
   * realpath('./a//b/../c') ==> 'a/c'
   */
  function realpath(path) {
    MULTIPLE_SLASH_RE.lastIndex = 0

    // 'file:///a//b/c' ==> 'file:///a/b/c'
    // 'http://a//b/c' ==> 'http://a/b/c'
    if (MULTIPLE_SLASH_RE.test(path)) {
      path = path.replace(MULTIPLE_SLASH_RE, '$1\/')
    }

    // 'a/b/c', just return.
    if (path.indexOf('.') === -1) {
      return path
    }

    var original = path.split('/')
    var ret = [], part

    for (var i = 0; i < original.length; i++) {
      part = original[i]

      if (part === '..') {
        if (ret.length === 0) {
          throw new Error('The path is invalid: ' + path)
        }
        ret.pop()
      }
      else if (part !== '.') {
        ret.push(part)
      }
    }

    return ret.join('/')
  }


  /**
   * Normalizes an uri.
   */
  function normalize(uri) {
    uri = realpath(uri)
    var lastChar = uri.charAt(uri.length - 1)

    if (lastChar === '/') {
      return uri
    }

    // Adds the default '.js' extension except that the uri ends with #.
    // ref: http://jsperf.com/get-the-last-character
    if (lastChar === '#') {
      uri = uri.slice(0, -1)
    }
    else if (uri.indexOf('?') === -1 && !FILE_EXT_RE.test(uri)) {
      uri += '.js'
    }

    // Remove ':80/' for bug in IE
    if (uri.indexOf(':80/') > 0) {
      uri = uri.replace(':80/', '/')
    }

    return uri
  }


  /**
   * Parses {{xxx}} in the module id.
   */
  function parseVars(id) {
    if (id.indexOf('{') === -1) {
      return id
    }

    var vars = config.vars

    return id.replace(VARS_RE, function(m, key) {
      return vars.hasOwnProperty(key) ? vars[key] : ''
    })
  }


  /**
   * Parses alias in the module id. Only parse the first part.
   */
  function parseAlias(id) {
    // #xxx means xxx is already alias-parsed.
    if (id.charAt(0) === '#') {
      return id.substring(1)
    }

    var alias = config.alias

    // Only top-level id needs to parse alias.
    if (alias && isTopLevel(id)) {
      var parts = id.split('/')
      var first = parts[0]

      if (alias.hasOwnProperty(first)) {
        parts[0] = alias[first]
        id = parts.join('/')
      }
    }

    return id
  }


  var mapCache = {}

  /**
   * Converts the uri according to the map rules.
   */
  function parseMap(uri) {
    // map: [[match, replace], ...]
    var map = config.map || []
    if (!map.length) return uri

    var ret = uri

    // Apply all matched rules in sequence.
    for (var i = 0; i < map.length; i++) {
      var rule = map[i]

      if (util.isArray(rule) && rule.length === 2) {
        var m = rule[0]

        if (util.isString(m) && ret.indexOf(m) > -1 ||
            util.isRegExp(m) && m.test(ret)) {
          ret = ret.replace(m, rule[1])
        }
      }
      else if (util.isFunction(rule)) {
        ret = rule(ret)
      }
    }

    if (!isAbsolute(ret)) {
      ret = realpath(dirname(pageUri) + ret)
    }

    if (ret !== uri) {
      mapCache[ret] = uri
    }

    return ret
  }


  /**
   * Gets the original uri.
   */
  function unParseMap(uri) {
    return mapCache[uri] || uri
  }


  /**
   * Converts id to uri.
   */
  function id2Uri(id, refUri) {
    if (!id) return ''

    id = parseAlias(parseVars(id))
    refUri || (refUri = pageUri)

    var ret

    // absolute id
    if (isAbsolute(id)) {
      ret = id
    }
    // relative id
    else if (isRelative(id)) {
      // Converts './a' to 'a', to avoid unnecessary loop in realpath.
      if (id.indexOf('./') === 0) {
        id = id.substring(2)
      }
      ret = dirname(refUri) + id
    }
    // root id
    else if (isRoot(id)) {
      ret = refUri.match(ROOT_RE)[1] + id
    }
    // top-level id
    else {
      ret = config.base + '/' + id
    }

    return normalize(ret)
  }


  function isAbsolute(id) {
    return id.indexOf('://') > 0 || id.indexOf('//') === 0
  }


  function isRelative(id) {
    return id.indexOf('./') === 0 || id.indexOf('../') === 0
  }


  function isRoot(id) {
    return id.charAt(0) === '/' && id.charAt(1) !== '/'
  }


  function isTopLevel(id) {
    var c = id.charAt(0)
    return id.indexOf('://') === -1 && c !== '.' && c !== '/'
  }


  /**
   * Normalizes pathname to start with '/'
   * Ref: https://groups.google.com/forum/#!topic/seajs/9R29Inqk1UU
   */
  function normalizePathname(pathname) {
    if (pathname.charAt(0) !== '/') {
      pathname = '/' + pathname
    }
    return pathname
  }


  var loc = global['location']
  var pageUri = loc.protocol + '//' + loc.host +
      normalizePathname(loc.pathname)

  // local file in IE: C:\path\to\xx.js
  if (pageUri.indexOf('\\') > 0) {
    pageUri = pageUri.replace(/\\/g, '/')
  }


  util.dirname = dirname
  util.realpath = realpath
  util.normalize = normalize

  util.parseVars = parseVars
  util.parseAlias = parseAlias
  util.parseMap = parseMap
  util.unParseMap = unParseMap

  util.id2Uri = id2Uri
  util.isAbsolute = isAbsolute
  util.isRoot = isRoot
  util.isTopLevel = isTopLevel

  util.pageUri = pageUri

})(seajs._util, seajs._config, this)

/**
 * Utilities for fetching js and css files
 */
;(function(util, config) {

  var doc = document
  var head = doc.head ||
      doc.getElementsByTagName('head')[0] ||
      doc.documentElement

  var baseElement = head.getElementsByTagName('base')[0]

  var IS_CSS_RE = /\.css(?:\?|$)/i
  var READY_STATE_RE = /loaded|complete|undefined/

  var currentlyAddingScript
  var interactiveScript


  util.fetch = function(url, callback, charset) {
    var isCSS = IS_CSS_RE.test(url)
    var node = document.createElement(isCSS ? 'link' : 'script')

    if (charset) {
      var cs = util.isFunction(charset) ? charset(url) : charset
      cs && (node.charset = cs)
    }

    assetOnload(node, callback || noop)

    if (isCSS) {
      node.rel = 'stylesheet'
      node.href = url
    } else {
      node.async = 'async'
      node.src = url
    }

    // For some cache cases in IE 6-9, the script executes IMMEDIATELY after
    // the end of the insertBefore execution, so use `currentlyAddingScript`
    // to hold current node, for deriving url in `define`.
    currentlyAddingScript = node

    // ref: #185 & http://dev.jquery.com/ticket/2709
    baseElement ?
        head.insertBefore(node, baseElement) :
        head.appendChild(node)

    currentlyAddingScript = null
  }

  function assetOnload(node, callback) {
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, callback)
    } else {
      styleOnload(node, callback)
    }
  }

  function scriptOnload(node, callback) {

    node.onload = node.onerror = node.onreadystatechange = function() {
      if (READY_STATE_RE.test(node.readyState)) {

        // Ensure only run once and handle memory leak in IE
        node.onload = node.onerror = node.onreadystatechange = null

        // Remove the script to reduce memory leak
        if (node.parentNode && !config.debug) {
          head.removeChild(node)
        }

        // Dereference the node
        node = undefined

        callback()
      }
    }

  }

  function styleOnload(node, callback) {

    // for Old WebKit and Old Firefox
    if (isOldWebKit || isOldFirefox) {
      util.log('Start poll to fetch css')

      setTimeout(function() {
        poll(node, callback)
      }, 1) // Begin after node insertion
    }
    else {
      node.onload = node.onerror = function() {
        node.onload = node.onerror = null
        node = undefined
        callback()
      }
    }

  }

  function poll(node, callback) {
    var isLoaded

    // for WebKit < 536
    if (isOldWebKit) {
      if (node['sheet']) {
        isLoaded = true
      }
    }
    // for Firefox < 9.0
    else if (node['sheet']) {
      try {
        if (node['sheet'].cssRules) {
          isLoaded = true
        }
      } catch (ex) {
        // The value of `ex.name` is changed from
        // 'NS_ERROR_DOM_SECURITY_ERR' to 'SecurityError' since Firefox 13.0
        // But Firefox is less than 9.0 in here, So it is ok to just rely on
        // 'NS_ERROR_DOM_SECURITY_ERR'
        if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
          isLoaded = true
        }
      }
    }

    setTimeout(function() {
      if (isLoaded) {
        // Place callback in here due to giving time for style rendering.
        callback()
      } else {
        poll(node, callback)
      }
    }, 1)
  }

  function noop() {
  }


  util.getCurrentScript = function() {
    if (currentlyAddingScript) {
      return currentlyAddingScript
    }

    // For IE6-9 browsers, the script onload event may not fire right
    // after the the script is evaluated. Kris Zyp found that it
    // could query the script nodes and the one that is in "interactive"
    // mode indicates the current script.
    // Ref: http://goo.gl/JHfFW
    if (interactiveScript &&
        interactiveScript.readyState === 'interactive') {
      return interactiveScript
    }

    var scripts = head.getElementsByTagName('script')

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i]
      if (script.readyState === 'interactive') {
        interactiveScript = script
        return script
      }
    }
  }

  util.getScriptAbsoluteSrc = function(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4)
  }


  util.importStyle = function(cssText, id) {
    // Don't add multi times
    if (id && doc.getElementById(id)) return

    var element = doc.createElement('style')
    id && (element.id = id)

    // Adds to DOM first to avoid the css hack invalid
    head.appendChild(element)

    // IE
    if (element.styleSheet) {
      element.styleSheet.cssText = cssText
    }
    // W3C
    else {
      element.appendChild(doc.createTextNode(cssText))
    }

    // IE NOTICE:
    // 31 limit: http://msdn.microsoft.com/en-us/library/ms531194(VS.85).aspx
    // 4095 limit: http://www.blueidea.com/tech/web/2009/7003.asp
  }


  var UA = navigator.userAgent

  // `onload` event is supported in WebKit since 535.23
  // Ref:
  //  - https://bugs.webkit.org/show_activity.cgi?id=38995
  var isOldWebKit = Number(UA.replace(/.*AppleWebKit\/(\d+)\..*/, '$1')) < 536

  // `onload/onerror` event is supported since Firefox 9.0
  // Ref:
  //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
  //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
  var isOldFirefox = UA.indexOf('Firefox') > 0 &&
      !('onload' in document.createElement('link'))


  /**
   * References:
   *  - http://unixpapa.com/js/dyna.html
   *  - ../tests/research/load-js-css/test.html
   *  - ../tests/issues/load-css/test.html
   *  - http://www.blaze.io/technical/ies-premature-execution-problem/
   */

})(seajs._util, seajs._config, this)

/**
 * The parser for dependencies
 * Ref: tests/research/parse-dependencies/test.html
 */
;(function(util) {

  var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
  var SLASH_RE = /\\\\/g

  util.parseDependencies = function(code) {
    var ret = [], m
    REQUIRE_RE.lastIndex = 0
    code = code.replace(SLASH_RE, '')

    while ((m = REQUIRE_RE.exec(code))) {
      if (m[2]) ret.push(m[2])
    }

    return util.unique(ret)
  }

})(seajs._util)

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

/**
 * The configuration
 */
;(function(seajs, util, config) {

  // Async inserted script
  var loaderScript = document.getElementById('seajsnode')

  // Static script
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script')
    loaderScript = scripts[scripts.length - 1]
  }

  var loaderSrc = (loaderScript && util.getScriptAbsoluteSrc(loaderScript)) ||
      util.pageUri // When sea.js is inline, set base to pageUri.

  var base = util.dirname(loaderSrc)
  util.loaderDir = base

  // When src is "http://test.com/libs/seajs/1.0.0/sea.js", redirect base
  // to "http://test.com/libs/"
  var match = base.match(/^(.+\/)seajs\/[\.\d]+(?:-dev)?\/$/)
  if (match) base = match[1]

  config.base = base
  config.main = loaderScript && loaderScript.getAttribute('data-main')
  config.charset = 'utf-8'


  /**
   * The function to configure the framework
   * config({
   *   'base': 'path/to/base',
   *   'vars': {
   *     'locale': 'zh-cn'
   *   },
   *   'alias': {
   *     'app': 'biz/xx',
   *     'jquery': 'jquery-1.5.2',
   *     'cart': 'cart?t=20110419'
   *   },
   *   'map': [
   *     ['test.cdn.cn', 'localhost']
   *   ],
   *   preload: [],
   *   charset: 'utf-8',
   *   debug: false
   * })
   *
   */
  seajs.config = function(o) {
    for (var k in o) {
      if (!o.hasOwnProperty(k)) continue

      var previous = config[k]
      var current = o[k]

      if (previous && (k === 'alias' || k === 'vars')) {
        for (var p in current) {
          if (current.hasOwnProperty(p)) {
            var prevValue = previous[p]
            var currValue = current[p]

            checkAliasConflict(prevValue, currValue, p)
            previous[p] = currValue
          }
        }
      }
      else if (previous && (k === 'map' || k === 'preload')) {
        // for config({ preload: 'some-module' })
        if (util.isString(current)) {
          current = [current]
        }

        util.forEach(current, function(item) {
          if (item) {
            previous.push(item)
          }
        })
      }
      else {
        config[k] = current
      }
    }

    // Makes sure config.base is an absolute path.
    var base = config.base
    if (base && !util.isAbsolute(base)) {
      config.base = util.id2Uri((util.isRoot(base) ? '' : './') + base + '/')
    }

    debugSync()

    return this
  }


  function debugSync() {
    // For convenient reference
    seajs.debug = !!config.debug
  }

  debugSync()

  function checkAliasConflict(previous, current, key) {
    if (previous && previous !== current) {
      util.log('The alias config is conflicted:',
          'key =', '"' + key + '"',
          'previous =', '"' + previous + '"',
          'current =', '"' + current + '"',
          'warn')
    }
  }

})(seajs, seajs._util, seajs._config)

/**
 * Prepare for bootstrapping
 */
;(function(seajs, util, global) {

  // The safe and convenient version of console.log
  seajs.log = util.log


  // Creates a stylesheet from a text blob of rules.
  seajs.importStyle = util.importStyle


  // Sets a alias to `sea.js` directory for loading plugins.
  seajs.config({
    alias: { seajs: util.loaderDir }
  })


  // Uses `seajs-xxx` flag to load plugin-xxx.
  util.forEach(getStartupPlugins(), function(name) {
    seajs.use('seajs/plugin-' + name)

    // Delays `seajs.use` calls to the onload of `mapfile` in debug mode.
    if (name === 'debug') {
      seajs._use = seajs.use
      seajs._useArgs = []
      seajs.use = function() { seajs._useArgs.push(arguments); return seajs }
    }
  })


  // Helpers
  // -------

  function getStartupPlugins() {
    var ret = []
    var str = global.location.search

    // Converts `seajs-xxx` to `seajs-xxx=1`
    str = str.replace(/(seajs-\w+)(&|$)/g, '$1=1$2')

    // Add cookie string
    str += ' ' + document.cookie

    // Excludes seajs-xxx=0
    str.replace(/seajs-(\w+)=[1-9]/g, function(m, name) {
      ret.push(name)
    })

    return util.unique(ret)
  }

})(seajs, seajs._util, this)

/**
 * The bootstrap and entrances
 */
;(function(seajs, config, global) {

  var _seajs = seajs._seajs

  // Avoids conflicting when sea.js is loaded multi times.
  if (_seajs && !_seajs['args']) {
    global.seajs = seajs._seajs
    return
  }


  // Assigns to global define.
  global.define = seajs.define


  // Loads the data-main module automatically.
  config.main && seajs.use(config.main)


    // Parses the pre-call of seajs.config/seajs.use/define.
  // Ref: tests/bootstrap/async-3.html
  ;(function(args) {
    if (args) {
      var hash = {
        0: 'config',
        1: 'use',
        2: 'define'
      }
      for (var i = 0; i < args.length; i += 2) {
        seajs[hash[args[i]]].apply(seajs, args[i + 1])
      }
    }
  })((_seajs || 0)['args'])


  // Add define.amd property for clear indicator.
  global.define.cmd = {}


  // Keeps clean!
  delete seajs.define
  delete seajs._util
  delete seajs._config
  delete seajs._seajs

})(seajs, seajs._config, this)

