(function(factory) {

  if (typeof define === 'function') {
    define(factory);
  }
  else if (typeof exports !== 'undefined') {
    factory(require, exports);
  }
  else {
    factory(null, (this['test'] = {}));
  }

})(function(require, exports) {

  function sendMessage(fn, msg, type) {
    var p = this;
    if (this != this.parent) {
      p = this.parent;
    }

    if (p && p[fn]) {
      p[fn](msg, type);
    }
    else if (msg && typeof console !== 'undefined') {
      console.log(color(msg, type));
    }
  }

  // https://github.com/loopj/commonjs-ansi-color/blob/master/lib/ansi-color.js
  var ANSI_CODES = {
    'fail': 31, // red
    'pass': 32, // green
    'info': 36 // cyan
  };

  function color(str, type) {
    return '\033[' + ANSI_CODES[type] + 'm  ' + str + '\033[0m';
  }


  exports.print = function(txt, style) {
    sendMessage('printResults', txt, style || 'info');
  };

  exports.assert = function (guard, message) {
    if (typeof message === 'undefined') {
      message = '';
    }

    if (guard) {
      exports.print('[PASS] ' + message, 'pass');
    } else {
      exports.print('[FAIL] ' + message, 'fail');
    }
  };

  exports.next = function() {
    setTimeout(function() {
      sendMessage('testNext');
    }, 500); // 留 500ms 空隙，使得异步操作能有时间完成。
  };

  exports.done = function() {
    exports.print('[DONE]');
    exports.next();
  };

});
