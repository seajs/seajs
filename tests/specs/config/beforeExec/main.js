
seajs.config({
  alias: {
    'a': './path/to/a.js'
  },
  vars: {
    'b': './path/to/b.js'
  },
  paths: {
    'to': './path/to/'
  },
  map: [
    ['d.js', 'beforeExec/path/to/d.js?1']
  ]
})


define(function(require) {
  // Config before exec is safety
  seajs.config({
    alias: {
      'a': './path/to/a1.js'
    },
    vars: {
      'b': './path/to/b1.js'
    },
    paths: {
      'to': './path/to1/'
    },
    map: [
      ['d.js', 'beforeExec/path/to/d1.js?1']
    ]
  })

  var test = require('../../../test')

  var a = require('a')
  test.assert(a.name === 'a', a.name)

  var b = require('{b}')
  test.assert(b.name === 'b', b.name)

  var c = require('to/c')
  test.assert(c.name === 'c', c.name)

  var d = require('d')
  test.assert(d.name === 'd', d.name)

  test.next()

})

