module.declare(function(require, exports, module) {

  var test = require('test/test');

  test.assert(require('./a').foo === 'a', 'exports.foo');
  test.assert(require('./b').foo === 'b', 'module.exports');
  test.assert(require('./c').foo === 'c', 'return {}');
  test.assert(require('./d').foo === 'd', 'module.declare({})');

  test.print('DONE', 'info');

});
