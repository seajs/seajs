define(function(require) {

  var test = require('test/test');

  require('./a');
  test.print('DONE', 'info');

});
