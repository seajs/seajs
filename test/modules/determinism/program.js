define(function(require) {

  var test = require('../../test');
  require('./submodule/a');

  test.done();

});
