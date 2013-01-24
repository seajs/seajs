
seajs.config({
  alias: {
    'a': './path/to/a.js',
    'biz/b': './path/to/biz/b'
  }
})


define(function(require) {

  var test = require('../../test')
  var a = require('a')
  var b = require('biz/b')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)

  test.done()

})

