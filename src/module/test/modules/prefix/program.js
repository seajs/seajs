
module
    .prefix('github', 'https://github.com/seajs/seajs/raw/master/src/module/test/modules/prefix/submodules')
    .prefix('sub', 'submodule/sub')
    .declare(['test', 'a', 'github/b', 'sub/c', '~/test/prefix/d'], function(require) {

  var test = require('test');
  var a = require('a');
  var b = require('b');
  var c = require('c');
  var d = require('d');

  test.assert(a.foo == 'a', 'a.foo should equal to "a".');
  test.assert(b.foo == 'b', 'b.foo should equal to "b".');
  test.assert(c.foo == 'c', 'c.foo should equal to "c".');
  test.assert(d.foo == 'd', 'd.foo should equal to "d".');

  test.print('DONE', 'info');

});
