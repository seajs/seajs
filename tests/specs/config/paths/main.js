
seajs.config({
  alias: {
    'b': 'biz/b'
  },
  paths: {
    'biz': './path/to/biz',
    'to': './path/to/',
    'hy-phen': './path/to/biz'
  }
})


define(function(require) {

  var test = require('../../../test')

  var a = require('to/a')
  var b = require('b')
  var d = require('hy-phen/d')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)
  test.assert(d.name === 'd', d.name)

  require.async('to/c', function(c) {
    test.assert(c.name === 'c', c.name)
    test.next()
  })

})

