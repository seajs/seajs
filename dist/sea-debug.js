/**
 * @preserve SeaJS v2.0.0-beta | seajs.org/LICENSE.md
 */
(function(global, undefined) {
"use strict"

// Avoid conflicting when `sea.js` is loaded multiple times
if (global.seajs) {
  return
}


var seajs = global.seajs = {
  // The current version of SeaJS being used
  version: "2.0.0-beta"
}


/**
 * util-lang.js - The minimal language enhancement
 */

var hasOwnProperty = {}.hasOwnProperty

function hasOwn(obj, prop) {
  return hasOwnProperty.call(obj, prop)
}

function isFunction(obj) {
  return typeof obj === "function"
}

var isArray = Array.isArray || function(obj) {
  return obj instanceof Array
}

function unique(arr) {
  var obj = {}
  var ret = []

  for (var i = 0, len = arr.length; i < len; i++) {
    var item = arr[i]
    if (obj[item] !== 1) {
      obj[item] = 1
      ret.push(item)
    }
  }

  return ret
}


/**
 * util-log.js - The tiny log function
 */

// The safe wrapper for `console.xxx` functions
// log("message") ==> console.log("message")
// log("message", "warn") ==> console.warn("message")
var log = seajs.log = function(msg, type) {
  var console = global.console

  if (console) {
    // Do NOT print `log(msg)` in non-debug mode
    if (type || configData.debug) {
      console[type || "log"](msg)
    }
  }

}


/**
 * util-events.js - The minimal events support
 */

var eventsCache = {}

// Bind event
seajs.on = function(event, callback) {
  if (!callback) return seajs

  var list = eventsCache[event] || (eventsCache[event] = [])
  list.push(callback)

  return seajs
}

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
seajs.off = function(event, callback) {
  // Remove *all* events
  if (!(event || callback)) {
    eventsCache = {}
    return seajs
  }

  var list = eventsCache[event]
  if (list) {
    if (callback) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === callback) {
          list.splice(i, 1)
        }
      }
    }
    else {
      delete eventsCache[event]
    }
  }

  return seajs
}

// Emit event, firing all bound callbacks. Callbacks are passed the same
// arguments as `emit` is, apart from the event name
var emit = seajs.emit = function(event) {
  var list = eventsCache[event]
  if (!list) return seajs

  var args = []

  // Fill up `args` with the callback arguments.  Since we're only copying
  // the tail of `arguments`, a loop is much faster than Array#slice
  for (var i = 1, len = arguments.length; i < len; i++) {
    args[i - 1] = arguments[i]
  }

  // Copy callback lists to prevent modification
  list = list.slice()

  // Execute event callbacks
  for (i = 0, len = list.length; i < len; i++) {
    list[i].apply(global, args)
  }

  return seajs
}

// Emit event and return the specified property of the data
function emitData(event, data, prop) {
  emit(event, data)
  return data[prop]
}


/**
 * util-path.js - The utilities for operating path such as id, uri
 */

var DIRNAME_RE = /[^?]*(?=\/.*$)/
var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g
var URI_END_RE = /\.(?:css|js)|\/$/
var ROOT_RE = /^(.*?:\/\/.*?)(?:\/|$)/
var VARS_RE = /{([^{}]+)}/g


// Extract the directory portion of a path
// dirname("a/b/c.js") ==> "a/b/"
// dirname("d.js") ==> "./"
// ref: http://jsperf.com/regex-vs-split/2
function dirname(path) {
  var s = path.match(DIRNAME_RE)
  return (s ? s[0] : ".") + "/"
}

// Canonicalize a path
// realpath("./a//b/../c") ==> "a/c"
function realpath(path) {

  // "file:///a//b/c" ==> "file:///a/b/c"
  // "http://a//b/c" ==> "http://a/b/c"
  // "https://a//b/c" ==> "https://a/b/c"
  if (path.lastIndexOf("//") > 7) {
    path = path.replace(MULTIPLE_SLASH_RE, "$1\/")
  }

  // If "a/b/c", just return
  if (path.indexOf(".") === -1) {
    return path
  }

  var original = path.split("/")
  var ret = [], part

  for (var i = 0; i < original.length; i++) {
    part = original[i]

    if (part === "..") {
      if (ret.length === 0) {
        throw new Error("The path is invalid: " + path)
      }
      ret.pop()
    }
    else if (part !== ".") {
      ret.push(part)
    }
  }

  return ret.join("/")
}

// Normalize an uri
// normalize("path/to/a") ==> "path/to/a.js"
function normalize(uri) {
  // Call realpath() before adding extension, so that most of uris will
  // contains no `.` and will just return in realpath() call
  uri = realpath(uri)

  // Add the default `.js` extension except that the uri ends with `#`
  var lastChar = uri.charAt(uri.length - 1)
  if (lastChar === "#") {
    uri = uri.slice(0, -1)
  }
  else if (!URI_END_RE.test(uri) && uri.indexOf("?") === -1) {
    uri += ".js"
  }

  // issue #256: fix `:80` bug in IE
  uri = uri.replace(":80/", "/")

  return uri
}


function parseAlias(id) {
  var alias = configData.alias

  // Only parse top-level id
  if (alias && hasOwn(alias, id) && isTopLevel(id)) {
    id = alias[id]
  }

  return id
}

function parseVars(id) {
  var vars = configData.vars

  if (vars && id.indexOf("{") > -1) {
    id = id.replace(VARS_RE, function(m, key) {
      return hasOwn(vars, key) ? vars[key] : "{" + key + "}"
    })
  }

  return id
}

function addBase(id, refUri) {
  var ret

  // absolute id
  if (isAbsolute(id)) {
    ret = id
  }
  // relative id
  else if (isRelative(id)) {
    // Convert "./a" to "a", to avoid unnecessary loop in realpath() call
    if (id.indexOf("./") === 0) {
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
    ret = configData.base + id
  }

  return ret
}

function parseMap(uri) {
  var map = configData.map || []
  var ret = uri
  var len = map.length

  if (len) {
    for (var i = 0; i < len; i++) {
      var rule = map[i]

      ret = isFunction(rule) ?
          (rule(uri) || uri) :
          uri.replace(rule[0], rule[1])

      // Only apply the first matched rule
      if (ret !== uri) break
    }
  }

  return ret
}

function id2Uri(id, refUri) {
  if (!id) return ""

  id = parseAlias(id)
  id = parseVars(id)
  id = addBase(id, refUri || pageUri)
  id = normalize(id)
  id = parseMap(id)

  return id
}


function isAbsolute(id) {
  return id.indexOf("://") > 0 || id.indexOf("//") === 0
}

function isRelative(id) {
  return id.indexOf("./") === 0 || id.indexOf("../") === 0
}

function isRoot(id) {
  return id.charAt(0) === "/" && id.charAt(1) !== "/"
}

function isTopLevel(id) {
  var c = id.charAt(0)
  return id.indexOf("://") === -1 && c !== "." && c !== "/"
}


var doc = document
var loc = global.location

var pageUri = (function() {
  var pathname = loc.pathname

  // Normalize pathname to start with "/"
  // ref: https://groups.google.com/forum/#!topic/seajs/9R29Inqk1UU
  if (pathname.charAt(0) !== "/") {
    pathname = "/" + pathname
  }

  var pageUri = loc.protocol + "//" + loc.host + pathname

  // local file in IE: C:\path\to\xx.js
  if (pageUri.indexOf("\\") > -1) {
    pageUri = pageUri.replace(/\\/g, "/")
  }

  return pageUri
})()

// Recommend to add `seajs-node` id for the `sea.js` script element
var loaderScript = doc.getElementById("seajs-node") || (function() {
  var scripts = doc.getElementsByTagName("script")

  return scripts[scripts.length - 1] ||
      // Maybe undefined in some environment such as PhantomJS
      doc.createElement("script")
})()

var loaderUri = getScriptAbsoluteSrc(loaderScript) ||
    pageUri // When `sea.js` is inline, loaderUri is pageUri

function getScriptAbsoluteSrc(node) {
  return node.hasAttribute ? // non-IE6/7
      node.src :
    // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
      node.getAttribute("src", 4)
}


/**
 * util-request.js - The utilities for requesting script and style files
 * ref: tests/research/load-js-css/test.html
 */

var head = doc.head ||
    doc.getElementsByTagName("head")[0] ||
    doc.documentElement

var baseElement = head.getElementsByTagName("base")[0]

var IS_CSS_RE = /\.css(?:\?|$)/i
var READY_STATE_RE = /loaded|complete|undefined/

var currentlyAddingScript
var interactiveScript


function request(url, callback, charset) {
  var isCSS = IS_CSS_RE.test(url)
  var node = doc.createElement(isCSS ? "link" : "script")

  if (charset) {
    var cs = isFunction(charset) ? charset(url) : charset
    if (cs) {
      node.charset = cs
    }
  }

  assetOnload(node, callback)

  if (isCSS) {
    node.rel = "stylesheet"
    node.href = url
  }
  else {
    node.async = true
    node.src = url
  }

  // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
  // the end of the insert execution, so use `currentlyAddingScript` to
  // hold current node, for deriving url in `define` call
  currentlyAddingScript = node

  // ref: #185 & http://dev.jquery.com/ticket/2709
  baseElement ?
      head.insertBefore(node, baseElement) :
      head.appendChild(node)

  currentlyAddingScript = null
}

function assetOnload(node, callback) {
  if (node.nodeName === "SCRIPT") {
    scriptOnload(node, callback)
  }
  else {
    styleOnload(node, callback)
  }
}

function scriptOnload(node, callback) {
  node.onload = node.onerror = node.onreadystatechange = function() {
    if (READY_STATE_RE.test(node.readyState)) {

      // Ensure only run once and handle memory leak in IE
      node.onload = node.onerror = node.onreadystatechange = null

      // Remove the script to reduce memory leak
      if (!configData.debug) {
        head.removeChild(node)
      }

      // Dereference the node
      node = undefined

      if (callback) {
        callback()
      }
    }
  }
}

function styleOnload(node, callback) {
  // for Old WebKit and Old Firefox
  if (isOldWebKit || isOldFirefox) {
    setTimeout(function() {
      pollStyle(node, callback)
    }, 1) // Begin after node insertion
  }
  else {
    node.onload = node.onerror = function() {
      node.onload = node.onerror = null
      node = undefined

      if (callback) {
        callback()
      }
    }
  }
}

function pollStyle(node, callback) {
  var sheet = node.sheet
  var isLoaded

  // for WebKit < 536
  if (isOldWebKit) {
    if (sheet) {
      isLoaded = true
    }
  }
  // for Firefox < 9.0
  else if (sheet) {
    try {
      if (sheet.cssRules) {
        isLoaded = true
      }
    } catch (ex) {
      // The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
      // to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
      // in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
      if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
        isLoaded = true
      }
    }
  }

  setTimeout(function() {
    if (isLoaded) {
      // Place callback in here due to giving time for style rendering
      callback()
    }
    else {
      pollStyle(node, callback)
    }
  }, 1)
}

function getCurrentScript() {
  if (currentlyAddingScript) {
    return currentlyAddingScript
  }

  // For IE6-9 browsers, the script onload event may not fire right
  // after the the script is evaluated. Kris Zyp found that it
  // could query the script nodes and the one that is in "interactive"
  // mode indicates the current script
  // ref: http://goo.gl/JHfFW
  if (interactiveScript && interactiveScript.readyState === "interactive") {
    return interactiveScript
  }

  var scripts = head.getElementsByTagName("script")

  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i]
    if (script.readyState === "interactive") {
      interactiveScript = script
      return interactiveScript
    }
  }
}


var UA = navigator.userAgent

// `onload` event is supported in WebKit since 535.23
// ref: https://bugs.webkit.org/show_activity.cgi?id=38995
var isOldWebKit = Number(UA.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) < 536

// `onload/onerror` event is supported since Firefox 9.0
// ref:
//  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
//  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
var isOldFirefox = UA.indexOf("Firefox") > 0 &&
    !("onload" in doc.createElement("link"))


/**
 * util-deps.js - The parser for dependencies
 * ref: tests/research/parse-dependencies/test.html
 */

var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
var SLASH_RE = /\\\\/g

function parseDependencies(code) {
  var ret = [], m
  REQUIRE_RE.lastIndex = 0
  code = code.replace(SLASH_RE, "")

  while ((m = REQUIRE_RE.exec(code))) {
    if (m[2]) ret.push(m[2])
  }

  return ret
}


/**
 * module.js - The core of module loader
 */

var cachedModules = seajs.cache = {}

var STATUS = Module.STATUS = {
  "INITIALIZED": 1, // The module is initialized
  "SAVED": 2,       // The module data has been saved to cachedModules
  "LOADED": 3,      // The module and all its dependencies are ready to compile
  "COMPILING": 4,   // The module is being compiled
  "COMPILED": 5     // The module is compiled and `module.exports` is available
}

function Module(uri, status) {
  this.uri = uri
  this.status = status || STATUS.INITIALIZED
  this.dependencies = []
  this.waitings = []
}

Module.prototype.load = function(ids, callback) {
  var uris = resolve(isArray(ids) ? ids : [ids], this.uri)

  load(uris, function() {
    var exports = []

    for (var i = 0, len = uris.length; i < len; i++) {
      exports[i] = compile(cachedModules[uris[i]])
    }

    if (callback) {
      callback.apply(global, exports)
    }
  })

  return this
}

function resolve(ids, refUri) {
  if (isArray(ids)) {
    // Use `for` loop instead of `forEach` or `map` function for performance
    var ret = []
    for (var i = 0, len = ids.length; i < len; i++) {
      ret[i] = resolve(ids[i], refUri)
    }
    return ret
  }

  var id = emitData("resolve", { id: ids }, "id")
  return emitData("resolved", { uri: id2Uri(id, refUri) }, "uri")
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
  // Emit `fetch` event. Plugins could use this event to
  // modify uri or do other magic things
  var requestUri = emitData("fetch",
      { uri: uri, fetchedList: fetchedList },
      "uri")

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
  var charset = configData.charset
  var requested = emitData("request",
      { uri: requestUri, callback: onRequested, charset: charset },
      "requested")

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
      derivedUri = emitData("derived", { uri: derivedUri }, "uri")
    }
    else {
      log("Failed to derive script: " + factory)

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
  var mod = getModule(uri)

  // Do NOT override already saved modules
  if (mod.status < STATUS.SAVED) {

    // Let anonymous module id equal to its uri
    mod.id = meta.id || uri

    // Remove duplicated dependencies
    mod.dependencies = unique(resolve(meta.dependencies || [], uri))

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

  require.cache = cachedModules


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

  for (var i = 0, len = uris.length; i < len; i++) {
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
  var arrC = arrA.concat(arrB)
  return  unique(arrC).length < arrC.length
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
  log("Found circular dependencies: " + stack.join(" --> "))
}


// Public API

var globalModule = new Module(pageUri, STATUS.COMPILED)

seajs.use = function(ids, callback) {
  var preloadMods = configData.preload
  configData.preload = []

  // Load preload modules before all other modules
  globalModule.load(preloadMods, function() {
    globalModule.load(ids, callback)
  })

  return seajs
}

global.define = define


/**
 * config.js - The configuration for the loader
 */

var configData = config.data = {
  // The root path to use for id2uri parsing
  base: (function() {
    var ret = dirname(loaderUri)

    // If loaderUri is `http://test.com/libs/seajs/1.0.0/sea.js`, the baseUri
    // should be `http://test.com/libs/`
    var m = ret.match(/^(.+\/)seajs\/\d[^/]+\/$/)
    if (m) {
      ret = m[1]
    }

    return ret
  })(),

  // The charset for requesting files
  charset: "utf-8"

  // debug: false - Debug mode
  // alias - The shorthand alias for module id
  // vars - The {xxx} variables in module id
  // map - An array containing rules to map module uri
  // preload - Modules that are needed to load before all other modules
  // plugins - An array containing needed plugins
}

function config(data) {
  for (var key in data) {
    var curr = data[key]

    if (hasOwn(data, key) && curr !== undefined) {
      // Convert plugins to preload config
      if (key === "plugins") {
        key = "preload"
        curr = plugin2preload(curr)
      }

      var prev = configData[key]

      // For alias, vars
      if (prev && /alias|vars/.test(key)) {
        for (var k in curr) {
          if (hasOwn(curr, k)) {

            var val = curr[k]
            if (k in prev) {
              checkConfigConflict(prev[k], val, k, key)
            }

            prev[k] = val
          }
        }
      }
      else {
        // For map, preload
        if (isArray(prev)) {
          curr = prev.concat(curr)
        }

        // Set config
        configData[key] = curr

        // Make sure that `configData.base` is an absolute path
        if (key === "base") {
          makeBaseAbsolute()
        }
      }
    }
  }

  return seajs
}

seajs.config = config


function plugin2preload(arr) {
  var ret = [], name
  isArray(arr) || (arr = [arr])

  while ((name = arr.shift())) {
    ret.push("{seajs}/plugin-" + name)
  }

  return ret
}

function checkConfigConflict(prev, curr, k, key) {
  if (prev !== curr) {
    log("The config of " + key + '["' + k + '"] is changed from "' +
        prev + '" to "' + curr + '"', "warn")
  }
}

function makeBaseAbsolute() {
  var base = configData.base
  if (!isAbsolute(base)) {
    configData.base = id2Uri((isRoot(base) ? "" : "./") + base
        + (base.charAt(base.length - 1) === "/" ? "" : "/"))
  }
}


/**
 * bootstrap.js - Initialize the plugins and load the entry module
 */

var dataConfig = loaderScript.getAttribute("data-config")
var dataMain = loaderScript.getAttribute("data-main")

config({
  // Set `{seajs}` pointing to `http://path/to/sea.js` directory portion
  vars: { seajs: dirname(loaderUri) },

  // Add data-config to preload modules
  preload: dataConfig ? [dataConfig] : undefined,

  // Load initial plugins
  plugins: getBootstrapPlugins()
})

// NOTE: use `seajs-xxx=1` flag in url or cookie to enable `plugin-xxx`
function getBootstrapPlugins() {
  var ret = []

  // Convert `seajs-xxx` to `seajs-xxx=1`
  var str = loc.search.replace(/(seajs-\w+)(&|$)/g, "$1=1$2")

  // Add cookie string
  str += " " + doc.cookie

  // Exclude seajs-xxx=0
  str.replace(/seajs-(\w+)=1/g, function(m, name) {
    ret.push(name)
  })

  return ret.length ? unique(ret) : undefined
}


if (dataMain) {
  seajs.use(dataMain)
}

})(this);
