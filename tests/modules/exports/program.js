define(function(require, exports) {

  var test = require('../../test');

  test.assert(require('./a').foo === 'a', 'exports.foo');
  test.assert(require('./b').foo === 'b', 'module.exports');
  test.assert(require('./c').foo === 'c', 'return {}');
  test.assert(require('./d').foo === 'd', 'define({})');

  test.assert(require('./a').foo2 === undefined, 'exports.foo2');

  test.done();

});
