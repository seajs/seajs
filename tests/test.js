(function(factory) {

  if (typeof define === 'function') {
    define(factory)
  }
  else if (typeof exports !== 'undefined') {
    factory(require, exports)
  }
  else {
    factory(null, (this['test'] = {}))
  }

})(function(require, exports) {


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
    setTimeout(function() {
      sendMessage('testNext')
    }, 500) // Leave time for async operation
  }

  exports.done = function() {
    exports.print('[DONE]')
    exports.next()
  }


  function error(err) {
    // Firefox will throw an error when script is 404
    if (err !== 'Error loading script') {
      exports.print('[ERROR] ' + err, 'error')
    }
    exports.next()
  }

  // Collect errors in browser environment
  if (typeof process === 'undefined') {
    var _onerror = window.onerror
    window.onerror = function(err) {
      if (_onerror) _onerror(err)
      error(err)
    }
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

})
