module.declare(function(require) {

  var test = require('test/test');
  require('./submodule/a');

  test.print('DONE', 'info');

});
