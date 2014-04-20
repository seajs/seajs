define(function(require, exports) {
  exports.l = 'l';
  var j = require('./j');
  exports.l2 = 'l2';
  var test = require('../../../test');
  test.assert(j.j === 'j', 'j.j should be j');
  test.assert(j.j2 === undefined, 'j.j2 should be undefined');
});