define(function(require, exports) {
  exports.n = 'n';
  var o = require('./o');
  var m = require('./m');
  exports.n2 = 'n2';
  var test = require('../../../test');
  test.assert(o.o === 'o', 'o.o should be o');
  test.assert(o.o2 === 'o2', 'o.o2 should be o2');
  test.assert(m.m === 'm', 'm.m should be m');
  test.assert(m.m2 === undefined, 'm.m2 should be undefined');
});