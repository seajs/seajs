define(function(require) {

  var test = require('../../test')
  var a = require('a')


  // map case
  test.assert(a.name === 'a-debug', a.name)


  // use case
  require.async('./b', function(b) {
    test.assert(b.name === 'b', b.name)
    test.done()
  })

})
