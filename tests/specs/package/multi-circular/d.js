define(function(require, exports) {
  exports.d = 'd';
  var c = require('./c');
  exports.d2 = 'd2';
  var e = require('./e');
  var test = require('../../../test');
  test.assert(c.c === 'c', 'c.c should be c');
  test.assert(c.c2 === undefined, 'c.c2 should be undefined');
  test.assert(e === 'e', 'e should be e');
});