
// Hack console for testing
(function(global) {
  var console = global.console
  if (!console) return

  console._log = console.log
  console._warn = console.warn

  console.log = function(arg1, arg2) {
    var msg = arg2 ? arg1 + ' ' + arg2 : arg1
    global.consoleMsg = msg
    console._log(msg)
  }

  console.warn = function(arg1, arg2) {
    var msg = arg2 ? arg1 + ' ' + arg2 : arg1
    global.consoleMsg = msg
    console._warn(msg)
  }
})(this)

function printResults(txt, style) {
  var d = document.createElement('div')
  d.innerHTML = txt
  d.className = style
  document.getElementById('out').appendChild(d)
}

function printHeader(test, url) {
  var h = document.createElement('h3')
  h.innerHTML = test +
      (url ? ' <a class="hash" href="' + url + '">#</a>' : '')
  document.getElementById('out').appendChild(h)
}


define(function(require, exports) {
  var global = this
  var queue = []

  require.async('./style.css')
  handleGlobalError()

  exports.print = function(txt, style) {
    sendMessage('printResults', txt, style || 'info')
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
    reset()

    if (queue.length) {
      var id = queue.shift()
      sendMessage('printHeader', id, getSingleSpecUri(id))
      seajs.use(configData.base + '../tests/' + id + '/main.js')
    }
    else {
      exports.done()
    }
  }

  exports.run = function(ids) {
    var id = parseIdFromUri()
    queue = id ? [id] : ids
    exports.next()
  }

  exports.done = function() {
    exports.print('[DONE]')
    sendMessage('testNextPage')
  }


  // Helpers

  var configData = seajs.config.data
  var defaultConfig = copy(configData, {})

  function reset() {
    copy(defaultConfig, configData)
    global.consoleMsg = undefined
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
    var p = this
    if (this != this.parent) {
      p = this.parent
    }

    if (p && p[fn]) {
      p[fn](msg, type)
    }
    else if (msg && typeof console !== 'undefined') {
      console.log(color(msg, type))
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
    return '\033[' + ANSI_CODES[type] + 'm  ' + str + '\033[0m'
  }

  function handleGlobalError() {
    if (typeof window === 'undefined') return

    window.onerror = function(err) {
      // Ignore 404 error that Firefox will throw when script is not found
      if (err !== 'Error loading script') {
        exports.print('[ERROR] ' + err, 'error')
      }

      // Go on
      exports.next()
    }
  }

  function getSingleSpecUri(id) {
    return location.href.replace(/\?.*$/, '') + '?' + encodeURIComponent(id)
  }

  function parseIdFromUri() {
    return decodeURIComponent(location.search)
        .replace(/&t=\d+/, '').substring(1)
  }

});

