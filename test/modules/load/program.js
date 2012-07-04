define(function(require) {

  var test = require('../../test')

  require.async('./a', function(a) {
    test.assert(a.foo === 'a', 'test require.async from factory')
    done()
  })

  require.async('./b')

  // load normal script file
  require.async('./c.js', function(c) {
    test.assert(c.name === 'c', c.name)
    done()
  })


  var count = 0

  function done() {
    if (++count === 2) {
      test.done()
    }
  }
})
