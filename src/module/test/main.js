module.declare([], function() {

  // initialize module loader
  var path = location.href.split('/').slice(0, -1).join('/') + '/';
  path = path + decodeURIComponent((location.search || '?').substring(1));
  module.reset(path);

  // add 'test' module
  module.declare('test', [], function(require, exports) {

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
  });

  module.provide(['program'], function(require) {
    //try {
      require('program');
    //} catch (x) {
    //  sendMessage('printResults', 'ERROR ' + x.message, 'error');
    //}
    sendMessage('testNext');
  });

  function sendMessage(msg, a1, a2) {
    var p = window.parent;
    if (p && p[msg]) p[msg](a1, a2);
  }

});