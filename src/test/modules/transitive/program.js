module.declare(function(require) {

  var test = require('test/test');

  test.assert(require('./a').foo() === 1, 'transitive.');
  test.print('DONE', 'info');

});
