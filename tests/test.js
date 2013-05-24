
if (typeof global === 'undefined') {
  global = this
}

if (typeof require === 'function') {
  var __require = require
}

// Hack `console` for testing
(function() {
  var console = global.console || ( global.console = {})
  var stack = global.consoleMsgStack = []

  console._log = console.log || noop
  console._warn = console.warn || noop

  console.log = function(msg) {
    stack.push(msg)
    console._log(msg)
  }

  console.warn = function(msg) {
    stack.push(msg)
    console._warn(msg)
  }

  function noop() {}

})()

// Add `printResult` and `printHeader` for browser environment
if (typeof document !== 'undefined') {

  global.printResult = function(txt, style) {
    var d = document.createElement('div')
    d.innerHTML = txt
    d.className = style
    document.getElementById('out').appendChild(d)
  }

  global.printHeader = function(test, url) {
    var h = document.createElement('h3')
    h.innerHTML = test +
        (url ? ' <a class="hash" href="' + url + '">#</a>' : '')
    document.getElementById('out').appendChild(h)
  }

}


// Define test module
(function(factory) {

  if (typeof define === 'function') {
    define(factory)
  }
  else if (typeof require === 'function') {
    factory(require, exports)
  }
  else {
    factory({}, (global.test = {}))
  }

})(function(require, exports) {

  var WARNING_TIME = isLocal() ? 50 : 5000
  var isNode = typeof process !== 'undefined'
  var INITIAL_CWD = isNode && seajs.cwd()

  var queue = []
  var time

  isNode || require.async && require.async('./style.css')
  handleGlobalError()


  exports.print = function(txt, style) {
    sendMessage('printResult', txt, style || 'info')
  }

  exports.assert = function (guard, message) {
    if (typeof message === 'undefined') {
      message = ''
    }

    if (guard) {
      exports.print('[PASS] ' + message, 'pass')
    }
    else {
      exports.print('[FAIL] ' + message, 'fail')
    }
  }

  exports.next = function() {
    if (queue.length) {
      printElapsedTime()

      var id = queue.shift()
      sendMessage('printHeader', id, getSingleSpecUri(id))
      id = reset(id)

      time = now()
      seajs.use(id2File(id))
    }
    else {
      printElapsedTime()
      exports.done()
    }
  }

  exports.run = function(ids) {
    var id = parseIdFromUri()
    queue = id ? [id] : ids
    exports.next()
  }

  exports.done = function() {
    sendMessage('testNextPage')
  }


  // Helpers

  var configData = global.seajs && seajs.config.data || {}
  var defaultConfig = copy(configData, {})

  function reset(id) {
    global.consoleMsgStack.length = 0
    seajs.off()

    // Restore default configurations
    copy(defaultConfig, configData)

    // Reset plugins
    for (var uri in seajs.cache) {
      if (uri.indexOf('/dist/plugin-') > 0) {
        seajs.cache[uri].destroy()

        if (typeof process !== 'undefined' &&
            process.execPath.indexOf('node.exe') > 0) {
          uri = uri.replace(/\//g, '\\')
        }

        __require && delete __require.cache[uri]
      }
    }

    // Change cwd and base to tests/specs/xxx
    if (isNode) {
      var parts = id.split('/')
      process.chdir(INITIAL_CWD + 'tests/specs/' + parts[0])
      seajs.cwd(normalize(process.cwd()))
      //console.log('  cwd = ' + seajs.cwd())
      id = parts[1]
    }

    // Set base to current working directory
    seajs.config({
      base: './'
    })

    return id
  }

  function copy(from, to) {
    for (var p in to) {
      if (to.hasOwnProperty(p)) {
        delete to[p]
      }
    }

    for (p in from) {
      if (from.hasOwnProperty(p)) {
        to[p] = from[p]
      }
    }

    return to
  }

  function sendMessage(fn, msg, type) {
    // Emit global message for test adapter
    global.publish && global.publish(fn, msg, type)

    var p = this
    if (this != this.parent) {
      p = this.parent
    }

    if (p && p[fn]) {
      p[fn](msg, type)
    }
    else if (msg && typeof console !== 'undefined') {
      // Call original log function
      console._log(color(msg, type))

      // Stop on failure
      if (type === 'fail') {
        throw new Error(msg)
      }
    }
  }

  // https://github.com/loopj/commonjs-ansi-color/blob/master/lib/ansi-color.js
  var ANSI_CODES = {
    'fail': 31, // red
    'error': 31, // red
    'pass': 32, // green
    'info': 37 // white
  }

  function color(str, type) {
    return '\033[' + (ANSI_CODES[type] || ANSI_CODES['info'])
        + 'm  ' + str + '\033[0m'
  }

  function handleGlobalError() {
    if (typeof window === 'undefined' || window.onerror) return

    window.onerror = function(err) {
      // Old Safari and Firefox will throw an error when script is 404
      if (err !== 'Error loading script') {
        exports.print('[ERROR] ' + err, 'error')
      }

      // Go on
      exports.next()
    }
  }

  function getSingleSpecUri(id) {
    // For Node.js
    if (typeof location === 'undefined') {
      return ''
    }

    return location.href.replace(/\?.*$/, '') + '?' + encodeURIComponent(id)
  }

  function parseIdFromUri() {
    // For Node.js
    if (typeof location === 'undefined') {
      return ''
    }

    return decodeURIComponent(location.search)
        .replace(/&?t=\d+/, '').substring(1)
  }

  function id2File(id) {
    return id.indexOf('.js') > 0 ? id : id + '/main.js'
  }

  function printElapsedTime() {
    if (time) {
      var diff = now() - time
      var style = diff > WARNING_TIME ? 'warn' : 'info'
      exports.print('Elapsed time: ' + diff + 'ms', style + ' time')
    }
  }

  function now() {
    return new Date().getTime()
  }

  function isLocal() {
    // For Node.js
    if (typeof location === 'undefined') {
      return true
    }

    var host = location.host
    return location.href.indexOf('file://') === 0 ||
        host === 'localhost' || host === '127.0.0.1'
  }

  function normalize(path) {
    return path.replace(/\\/g, "/")
  }

})

