define(function(require) {

  var test = require('../../../test')

  var a = require('a')
  var b = require('./b')
  var c = require('./c.js')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)
  test.assert(c.name === 'c', c.name)

  test.next()

})
