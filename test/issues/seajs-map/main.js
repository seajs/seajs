define(function(require) {

  var test = require('../../test')

  var a = require('./a')
  var b = require('./b')

  test.assert(a.name === 'a', 'a is ok')
  test.assert(b.name === 'b', 'b is ok')

  require.async('./c', function(c) {
    test.assert(c.name === 'c', 'c is ok')

    document.cookie = 'seajs=0``0; path=/; expires=' + new Date(0)
    test.done()
  })

})
