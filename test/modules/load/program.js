define(function(require) {

  var test = require('../../test')

  require.async('./a', function(a) {
    test.assert(a.foo === 'a', 'test require.async from factory')
  })

  require.async('./b')

  // load normal script file
  require.async('./c.js', function() {
    test.assert(this.cIsLoaded === true, this.cIsLoaded)
    test.done()
  })

})
