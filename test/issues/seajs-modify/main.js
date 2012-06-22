define(function(require) {

  var test = require('../../test')
  var a = require('./a')

  test.assert(a.a === 'a', a.a)
  test.assert(a.b === 'b', a.b)

  test.done()

})
