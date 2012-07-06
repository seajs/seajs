define(function(require) {

  var test = require('../../test')

  var path = typeof global !== 'undefined' ? // node environment
      'http://seajs.org/test/modules/require-async/' :
      './'

  require.async(['./a', path + 'b.js', path + 'c.js'], function(a, b, c) {

    test.assert(a.name === 'a', a.name + ' a from require.async')
    test.assert(b.name === 'b', b.name + ' b from require.async')
    test.assert(c.name === 'c', c.name + ' c from require.async')

    test.done()

  })

})
