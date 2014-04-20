define(function(require, exports) {
  exports.o = 'o';
  var m = require('./m');
  var n = require('./n');
  exports.o2 = 'o2';
  var test = require('../../../test');
  test.assert(n.n === 'n', 'n.n should be n');
  test.assert(n.n2 === undefined, 'n.n2 should be undefined');
  test.assert(m.m === 'm', 'm.m should be m');
  test.assert(m.m2 === undefined, 'm.m2 should be undefined');
});