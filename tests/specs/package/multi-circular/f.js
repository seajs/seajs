define(function(require, exports) {
  exports.f = 'f';
  var g = require('./g');
  exports.f2 = 'f2';
  var test = require('../../../test');
  test.assert(g === 'g', 'g should be g');
});