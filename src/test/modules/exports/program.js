define(function(require, exports) {

  var test = require('test/test');

  test.assert(require('./a').foo === 'a', 'exports.foo');
  test.assert(require('./b').foo === 'b', 'module.exports');
  test.assert(require('./c').foo === 'c', 'return {}');
  test.assert(require('./d').foo === 'd', 'define({})');

  test.print('DONE', 'info');

});
