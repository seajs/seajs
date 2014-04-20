define(function(require, exports) {
  exports.h = 'h';
  var f = require('./f');
  exports.h2 = 'h2';
  var test = require('../../../test');
  test.assert(f.f === 'f', 'f.f should be f');
  test.assert(f.f2 === undefined, 'f.f2 should be undefined');
});