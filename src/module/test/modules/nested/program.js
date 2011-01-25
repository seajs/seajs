module.declare(function(require) {

  var test = require('test/test');

  test.assert(require('./a/b/c/d').foo() === 1, 'nested module identifier.');
  test.print('DONE', 'info');

});
