
define('./main', function(require) {

  var test = require('../../test');

  var a = require('biz/a');
  var b = require('biz/b');
  var c = require('biz/sub/c');
  var d = require('biz/d');
  var e = require('biz/e');
  var x = require('x');
  var x2 = require('x2');

  test.assert(a.name === 'a', 'a is ok');
  test.assert(b.name === 'b', 'b is ok');
  test.assert(c.name === 'c', 'c is ok');
  test.assert(d.name === 'd', 'd is ok');
  test.assert(e.name === 'e', 'e is ok');
  test.assert(x.name === 'x', 'x is ok');
  test.assert(x2.name === 'x2', 'x2 is ok');

  test.done();

});

define('x2', function() {
  return { name: 'x2' };
});

define('biz/e', function(require, exports) {
  exports.name = 'e';
});
