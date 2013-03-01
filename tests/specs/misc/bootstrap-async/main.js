define(function(require) {

  var test = require('../../../test')

  var a = require('a')
  var b = require('./b')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)

  test.next()

})
