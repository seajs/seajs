define(function(require) {

  var test = require('../../test')
  var path = 'http://seajs.org/test/modules/require-async/'

  require.async(['./a', path + 'b.js', path + 'c.js'], function(a, b, c) {

    test.assert(a.name === 'a', a.name)
    test.assert(b.name === 'b', b.name)
    test.assert(c.name === 'c', c.name)

    test.done()

  })

})
