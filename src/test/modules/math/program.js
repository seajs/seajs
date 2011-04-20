module.declare(function(require, exports, module) {

  var test = require('test/test');
  var inc = require('./increment').increment;

  test.assert(inc(1) === 2, 'The result of inc(1) is 2.');
  test.print('DONE', 'info');

});
