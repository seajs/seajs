define('b', ['./a'], function(require, exports) {
  exports.b = 'b';
  var a = require('./a');
  exports.b2 = 'b2';
  var test = require('../test');
  test.assert(a.a === 'a', 'a.a should be a');
  test.assert(a.a2 === undefined, 'a.a2 should be undefined');
});