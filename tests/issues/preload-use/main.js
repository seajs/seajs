define(function(require) {

  var test = require('../../test')
  var a = require('a')

  test.assert(a.name === 'a.js', a.name)
  test.assert(N === 1, N)

  test.done()

})
