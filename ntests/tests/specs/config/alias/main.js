
seajs.config({
  alias: {
    'a': './path/to/a.js',
    'biz/b': './path/to/biz/b'
  }
})


define(function(require) {

  var test = require('../../../test')

  var a = require('a')
  var b = require('biz/b')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)


  seajs.config({
    alias: {
      'a': 'x', // override alias
      'c': './path/to/c'
    }
  })

  //var consoleMsg = global.consoleMsgStack.pop()
  //test.assert(consoleMsg === 'The config of alias["a"] is changed from "./path/to/a.js" to "x"', consoleMsg)

  require.async('c', function(c) {
    test.assert(c.name === 'c', c.name)
    test.next()
  })

})

