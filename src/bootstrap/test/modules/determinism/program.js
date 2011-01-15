module.declare(['test', 'submodule/a'], function(require) {

  var test = require('test');
  require('submodule/a');

  test.print('DONE', 'info');

});
