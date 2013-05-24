
seajs.config({
  base: './',
  alias: {
    'biz': '//com.seajs/biz'
  }
});

define('anywhere-x', [], function() {
  return { name: 'x' }
});

define('biz/d', [], function(require, exports) {
  exports.name = 'd'
});

define('anywhere-x2', [], function() {
  return { name: 'x2' }
});

define('biz/e', [], function(require, exports) {
  exports.name = 'e'
});

define('anywhere-main', null, function(require) {
  var test = require('../../test')

  var a = require('biz/a')
  var b = require('biz/b')
  var c = require('biz/sub/c')
  var d = require('biz/d')
  var e = require('biz/e')
  var x = require('anywhere-x')
  var x2 = require('anywhere-x2')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)
  test.assert(c.name === 'c', c.name)
  test.assert(d.name === 'd', d.name)
  test.assert(e.name === 'e', e.name)
  test.assert(x.name === 'x', x.name)
  test.assert(x2.name === 'x2', x2.name)

  test.next()
})

seajs.use('./anywhere/biz', function() {
  seajs.use('anywhere-main')
});

