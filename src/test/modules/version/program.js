module.declare(function (require) {

  var a = require('./a?v=1.0');
  var a2 = require('./a?v=2.0');

  var test = require('test/test');
  test.assert(a.foo === 1, 'module version.');
  test.assert(a.foo === a2.foo, 'module version.');
  test.print('DONE', 'info');

});
