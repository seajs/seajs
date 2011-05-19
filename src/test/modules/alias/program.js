
seajs.config({
  alias: {
    'sub': './submodule/sub',
    'sub2': './submodule/sub'
  }
});


define(function(require) {

  var test = require('test/test');
  var a = require('./a');
  var b = require('./submodule/b');
  var c = require('sub/c');
  var c2 = require('sub2/c2');
  var d = require('./d');

  test.assert(a.foo == 'a', 'a.foo should equal to "a".');
  test.assert(b.foo == 'b', 'b.foo should equal to "b".');
  test.assert(c.foo == 'c', 'c.foo should equal to "c".');
  test.assert(c2.foo == 'c2', 'should keep the previous config.alias.');
  test.assert(d.foo == 'd', 'd.foo should equal to "d".');

  test.print('DONE', 'info');

});
