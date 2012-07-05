define(function(require) {

  var test = require('../../test')
  var a = require('a')
  var c = require('c')

  // map case
  test.assert(c.name === 'c-src', c.name)
  test.assert(a.name === 'a-debug', a.name)


  // use case
  require.async('./b', function(b) {
    test.assert(b.name === 'b', b.name)
    test.done()
  })

})
