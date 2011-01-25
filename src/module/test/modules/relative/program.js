module.declare(function(require) {

  var test = require('test/test');
  var a = require('./submodule/a');
  var b = require('./submodule/b');

  test.assert(a.foo == b.foo, 'a and b share foo through a relative require.');
  test.print('DONE', 'info');

});
