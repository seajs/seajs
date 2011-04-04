
module
    .prefix('github',
    'https://github.com/seajs/seajs/raw/master/src/module/test/modules/prefix/submodule')
    .prefix('sub', './submodule/sub')
    .declare(function(require) {

  var test = require('test/test');
  var a = require('./a');
  //var b = require('github/b');
  var c = require('sub/c');
  var d = require('test/modules/prefix/d');

  test.assert(a.foo == 'a', 'a.foo should equal to "a".');
  //test.assert(b.foo == 'b', 'b.foo should equal to "b".');
  test.assert(c.foo == 'c', 'c.foo should equal to "c".');
  test.assert(d.foo == 'd', 'd.foo should equal to "d".');

  test.print('DONE', 'info');

});
