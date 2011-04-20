module.declare(function(require, exports) {

  function sendMessage(msg, a1, a2) {
    var p = window.parent;
    if (p && p[msg]) p[msg](a1, a2);
  }

  exports.print = function(txt, style) {
    sendMessage('printResults', txt, style);
  };

  exports.assert = function (guard, message) {
    if (typeof message === 'undefined') message = '';
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

});
