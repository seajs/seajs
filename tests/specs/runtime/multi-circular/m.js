define('m', ['./n', './o'], function(require, exports) {
  exports.m = 'm';
  var n = require('./n');
  var o = require('./o');
  exports.m2 = 'm2';
  var test = require('../test');
  test.assert(n.n === 'n', 'n.n should be n');
  test.assert(n.n2 === 'n2', 'n.n2 should be n2');
});