/**
 * @preserve SeaJS - A Module Loader for the Web
 * v1.1.8 | seajs.org | MIT Licensed
 */


/**
 * Base namespace for the framework.
 */
this.seajs = { _seajs: this.seajs }


/**
 * The version of the framework. It will be replaced with "major.minor.patch"
 * when building.
 */
seajs.version = '1.1.8'


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


  util.unique = function(arr) {
    var ret = []
    var o = {}

    forEach(arr, function(item) {
      o[item] = 1
    })

    if (Object.keys) {
      ret = Object.keys(o)
    }
    else {
      for (var p in o) {
        if (o.hasOwnProperty(p)) {
          ret.push(p)
        }
      }
    }

    return ret
  }


  util.keys = Object.keys

  if (!util.keys) {
    util.keys = function(o) {
      var ret = []

      for (var p in o) {
        if (o.hasOwnProperty(p)) {
          ret.push(p)
        }
      }

      return ret
    }
  }


  util.now = Date.now || function() {
    return new Date().getTime()
  }

})(seajs._util)

/**
 * The tiny console support
 */
;(function(util, config) {

  var AP = Array.prototype


  /**
   * The safe wrapper of console.log/error/...
   */
  util.log = function() {
    if (typeof console !== 'undefined') {
      var args = AP.slice.call(arguments)

      var type = 'log'
      var last = args[args.length - 1]
      console[last] && (type = args.pop())

      // Only show log info in debug mode
      if (type === 'log' && !config.debug) return

      var out = type === 'dir' ? args[0] : AP.join.call(args, ' ')
      console[type](out)
    }
  }

})(seajs._util, seajs._config)

/**
 * Path utilities for the framework
 */
;(function(util, config, global) {

  var DIRNAME_RE = /.*(?=\/.*$)/
  var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g
  var FILE_EXT_RE = /\.(?:css|js)$/
  var ROOT_RE = /^(.*?\w)(?:\/|$)/


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
   * Normalizes an url.
   */
  function normalize(url) {
    url = realpath(url)
    var lastChar = url.charAt(url.length - 1)

    if (lastChar === '/') {
      return url
    }

    // Adds the default '.js' extension except that the url ends with #.
    // ref: http://jsperf.com/get-the-last-character
    if (lastChar === '#') {
      url = url.slice(0, -1)
    }
    else if (url.indexOf('?') === -1 && !FILE_EXT_RE.test(url)) {
      url += '.js'
    }

    return url
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
   * Converts the url according to the map rules.
   */
  function parseMap(url, map) {
    // map: [[match, replace], ...]
    map || (map = config.map || [])
    if (!map.length) return url

    var ret = url

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

    if (ret !== url) {
      mapCache[ret] = url
    }

    return ret
  }


  /**
   * Gets the original url.
   */
  function unParseMap(url) {
    return mapCache[url] || url
  }


  /**
   * Converts id to uri.
   */
  function id2Uri(id, refUri) {
    id = parseAlias(id)
    refUri || (refUri = pageUrl)

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
  var pageUrl = loc.protocol + '//' + loc.host +
      normalizePathname(loc.pathname)

  // local file in IE: C:\path\to\xx.js
  if (pageUrl.indexOf('\\') > 0) {
    pageUrl = pageUrl.replace(/\\/g, '/')
  }


  util.dirname = dirname
  util.realpath = realpath
  util.normalize = normalize

  util.parseAlias = parseAlias
  util.parseMap = parseMap
  util.unParseMap = unParseMap

  util.id2Uri = id2Uri
  util.isAbsolute = isAbsolute
  util.isTopLevel = isTopLevel

  util.pageUrl = pageUrl

})(seajs._util, seajs._config, this)

/**
 * Utilities for fetching js and css files.
 */
;(function(util, config, global) {

  var doc = document
  var head = doc.head ||
      doc.getElementsByTagName('head')[0] ||
      doc.documentElement

  var baseElement = head.getElementsByTagName('base')[0]
  var isWebKit = navigator.userAgent.indexOf('AppleWebKit') > 0

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
    }
    else {
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

    // NOTICE:
    // Nothing will happen in Opera when the file status is 404. In this case,
    // the callback will be called when time is out.
  }

  function styleOnload(node, callback) {

    // for IE6-9 and Opera
    if (node.attachEvent || global.opera) {
      node.attachEvent('onload', callback)
      // NOTICE:
      // 1. "onload" will be fired in IE6-9 when the file is 404, but in
      //    this situation, Opera does nothing, so fallback to timeout.
      // 2. "onerror" doesn't fire in any browsers!
    }

    // Polling for Firefox, Chrome, Safari
    else {
      setTimeout(function() {
        poll(node, callback)
      }, 0) // Begin after node insertion
    }

  }

  function poll(node, callback) {
    if (callback.isCalled) {
      return
    }

    var isLoaded

    if (isWebKit) {
      if (node['sheet']) {
        isLoaded = true
      }
    }
    // for Firefox
    else if (node['sheet']) {
      try {
        if (node['sheet'].cssRules) {
          isLoaded = true
        }
      } catch (ex) {
        if (ex.name === 'SecurityError' || // firefox >= 13.0
            ex.name === 'NS_ERROR_DOM_SECURITY_ERR') { // old firefox
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
  }


  /**
   * References:
   *  - http://unixpapa.com/js/dyna.html
   *  - ../test/research/load-js-css/test.html
   *  - ../test/issues/load-css/test.html
   *  - http://www.blaze.io/technical/ies-premature-execution-problem/
   */

})(seajs._util, seajs._config, this)

/**
 * The parser for dependencies
 */
;(function(util) {

  var REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g


  util.parseDependencies = function(code) {
    // Parse these `requires`:
    //   var a = require('a');
    //   someMethod(require('b'));
    //   require('c');
    //   ...
    // Doesn't parse:
    //   someInstance.require(...);
    var ret = [], match

    code = removeComments(code)
    REQUIRE_RE.lastIndex = 0

    while ((match = REQUIRE_RE.exec(code))) {
      if (match[2]) {
        ret.push(match[2])
      }
    }

    return util.unique(ret)
  }

  // See: research/remove-comments-safely
  function removeComments(code) {
    return code
        .replace(/^\s*\/\*[\s\S]*?\*\/\s*$/mg, '') // block comments
        .replace(/^\s*\/\/.*$/mg, '') // line comments
  }

})(seajs._util)

/**
 * The Module constructor and its methods
 */
;(function(seajs, util, config) {

  var cachedModules = {}
  var cachedModifiers = {}
  var compileStack = []

  var STATUS = {
    'FETCHING': 1, // The module file is fetching now.
    'SAVED': 2,    // The module file has been fetched and info has been saved.
    'LOADED': 3,   // All dependencies are loaded.
    'COMPILED': 4  // The module.exports is available.
  }


  function Module(uri, status) {
    this.uri = uri
    this.status = status || 0

    // this.id is set when saving
    // this.factory is set when saving
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
        var module = cachedModules[uri] ||
            (cachedModules[uri] = new Module(uri, STATUS.FETCHING))

        module.status === STATUS.SAVED ? onSaved() : fetch(uri, onSaved)

        function onSaved() {
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
          // Maybe failed to fetch successfully, such as 404 error.
          else {
            cb()
          }
        }

      })(unLoadedUris[i])
    }

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
      if (!child || child.status < STATUS.LOADED) {
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
        util.log('Failed to derive URI from interactive script for:',
            factory.toString(), 'warn')

        // NOTE: If the id-deriving methods above is failed, then falls back
        // to use onload event to get the url.
      }
    }

    var meta = { id: id, dependencies: deps, factory: factory }

    if (uri) {
      save(uri, meta)
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

    var length = matches.length

    if (length === 1) {
      matches = matches[0]
    }
    else if (length === 0) {
      matches = null
    }

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
  Module.cache = cachedModules


  // Helpers
  // -------

  var fetchingList = {}
  var fetchedList = {}
  var callbackList = {}
  var anonymousModuleMeta = null
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

    // Fetches it
    Module._fetch(
        srcUrl,

        function() {
          fetchedList[srcUrl] = true

          // Saves anonymous module meta data
          if (anonymousModuleMeta) {
            save(uri, anonymousModuleMeta)
            anonymousModuleMeta = null
          }

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
      circularCheckStack = [uri]

      var isCircular = isCircularWaiting(cachedModules[dep], uri)
      if (isCircular) {
        circularCheckStack.push(uri)
        printCircularLog(circularCheckStack)
      }

      return !isCircular
    })
  }

  function isCircularWaiting(module, uri) {
    if (!module || module.status !== STATUS.SAVED) {
      return false
    }

    circularCheckStack.push(module.uri)
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

    ret && printCircularLog(stack, 'warn')
    return ret
  }

  function printCircularLog(stack, type) {
    util.log('Found circular dependencies:', stack.join(' --> '), type)
  }


  // Public API
  // ----------

  var globalModule = new Module(util.pageUrl, STATUS.COMPILED)

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


  // For normal users
  seajs.define = Module._define
  seajs.cache = Module.cache
  seajs.find = Module._find
  seajs.modify = Module._modify


  // For plugin developers
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

  var noCachePrefix = 'seajs-ts='
  var noCacheTimeStamp = noCachePrefix + util.now()


  // Async inserted script
  var loaderScript = document.getElementById('seajsnode')

  // Static script
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script')
    loaderScript = scripts[scripts.length - 1]
  }

  var loaderSrc = util.getScriptAbsoluteSrc(loaderScript) ||
      util.pageUrl // When sea.js is inline, set base to pageUrl.

  var base = util.dirname(loaderSrc)
  util.loaderDir = base

  // When src is "http://test.com/libs/seajs/1.0.0/sea.js", redirect base
  // to "http://test.com/libs/"
  var match = base.match(/^(.+\/)seajs\/[\d\.]+\/$/)
  if (match) {
    base = match[1]
  }

  config.base = base


  var dataMain = loaderScript.getAttribute('data-main')
  if (dataMain) {
    config.main = dataMain
  }


  // The default charset of module file.
  config.charset = 'utf-8'


  /**
   * The function to configure the framework
   * config({
   *   'base': 'path/to/base',
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

      if (previous && k === 'alias') {
        for (var p in current) {
          if (current.hasOwnProperty(p)) {

            var prevValue = previous[p]
            var currValue = current[p]

            // Converts {jquery: '1.7.2'} to {jquery: 'jquery/1.7.2/jquery'}
            if (/^\d+\.\d+\.\d+$/.test(currValue)) {
              currValue = p + '/' + currValue + '/' + p
            }

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
      config.base = util.id2Uri('./' + base + '/')
    }

    // Uses map to implement nocache.
    if (config.debug === 2) {
      config.debug = 1
      seajs.config({
        map: [
          [/^.*$/, function(url) {
            if (url.indexOf(noCachePrefix) === -1) {
              url += (url.indexOf('?') === -1 ? '?' : '&') + noCacheTimeStamp
            }
            return url
          }]
        ]
      })
    }

    debugSync()

    return this
  }


  function debugSync() {
    if (config.debug) {
      // For convenient reference
      seajs.debug = !!config.debug
    }
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
 * Prepare for debug mode
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

  // Uses `seajs-debug` flag to turn on debug mode.
  if (global.location.search.indexOf('seajs-debug') > -1 ||
      document.cookie.indexOf('seajs=1') > -1) {
    seajs.config({ debug: 2 }).use('seajs/plugin-debug')

    // Delays `seajs.use` calls to the onload of `mapfile`.
    seajs._use = seajs.use
    seajs._useArgs = []
    seajs.use = function() { seajs._useArgs.push(arguments); return seajs }
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
  // Ref: test/bootstrap/async-3.html
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


  // Keeps clean!
  delete seajs.define
  delete seajs._util
  delete seajs._config
  delete seajs._seajs

})(seajs, seajs._config, this)

