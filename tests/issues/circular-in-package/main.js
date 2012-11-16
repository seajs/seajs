define('main', ['a', 'b', '../../test'], function(require) {

  var test = require('../../test')

  var b = require('b')
  test.assert(b.name === b.b2, 'circular in package b')

  var a = require('a')
  test.assert(a.name === a.a2, 'circular in package a')

  test.done()
})
