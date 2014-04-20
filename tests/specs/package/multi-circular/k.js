define(function(require, exports) {
  exports.k = 'k';
  var j = require('./j');
  var l = require('./l');
  exports.k2 = 'k2';
  var test = require('../../../test');
  test.assert(j.j === 'j', 'j.j should be j');
  test.assert(j.j2 === undefined, 'j.j2 should be undefined');
  test.assert(l.l === 'l', 'l.l should be l');
  test.assert(l.l2 === 'l2', 'l.l2 should be l2');
});