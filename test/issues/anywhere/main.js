
define(['../../test', './biz.js'], function(require) {

  var test = require('../../test');

  var a = require('biz/a');
  var b = require('biz/b');
  var c = require('biz/sub/c');
  var d = require('biz/d');
  var e = require('biz/e');

  test.assert(a.name === 'a', 'a is ok');
  test.assert(b.name === 'b', 'b is ok');
  test.assert(c.name === 'c', 'c is ok');
  test.assert(d.name === 'd', 'd is ok');
  test.assert(e.name === 'e', 'e is ok');

  test.done();

});

define('biz/e', function(require, exports) {
  exports.name = 'e';
});
