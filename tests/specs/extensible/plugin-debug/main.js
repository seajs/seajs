define(function(require) {

  var test = require('../../../test')

  var a = require('./a')
  var b = require('./b')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)

  test.assert(document.getElementById('seajs-debug-console'), 'console div')

  require.async('./c', function(c) {
    test.assert(c.name === 'c', c.name)

    document.cookie = 'seajs-debug=0``0; path=/; expires=' + new Date(0)
    test.next()
  })

})
