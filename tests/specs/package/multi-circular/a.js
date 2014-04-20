define(function(require, exports) {
  exports.a = 'a';
  var b = require('./b');
  exports.a2 = 'a2';
  var test = require('../../../test');
  test.assert(b.b === 'b', 'b.b should be b');
  test.assert(b.b2 === 'b2', 'b.b2 should be b2');
});