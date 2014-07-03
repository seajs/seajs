define('j', ['./k'], function(require, exports) {
  exports.j = 'j';
  var k = require('./k');
  exports.j2 = 'j2';
  var test = require('../test');
  test.assert(k.k === 'k', 'k.k should be k');
  test.assert(k.k2 === 'k2', 'k.k2 should be k2');
});