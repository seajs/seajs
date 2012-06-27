define(function(require) {

  var test = require('../../test')

  var a = require('./a2.coffee')
  var b = require('./b.coffee')
  var c = require('coffee!./c.coffee')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)
  test.assert(c.name === 'c', c.name)
  test.assert(b.a === a, b.a.name)

  test.done()
})
