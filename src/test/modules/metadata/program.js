module.declare(function(require, exports, module) {

  var test = require('test/test');

  require('./a');
  test.print('DONE', 'info');

});
