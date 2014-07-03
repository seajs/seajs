define('c', ['./d'], function(require, exports) {
  exports.c = 'c';
  var d = require('./d');
  exports.c2 = 'c2';
  var test = require('../test');
  test.assert(d.d === 'd', 'd.d should be d');
  test.assert(d.d2 === 'd2', 'd.d2 should be d2');
});