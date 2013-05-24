
seajs.config({
  alias: {
    'b': 'biz/b'
  },
  paths: {
    'biz': './path/to/biz',
    'to': './path/to'
  }
})


define(function(require) {

  var test = require('../../../test')

  var a = require('to/a')
  var b = require('b')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)

  require.async('to/c', function(c) {
    test.assert(c.name === 'c', c.name)
    test.next()
  })

})

