seajs.config({
  alias: {
    'a': 'require-global/a.js',
    'b': 'require-global/b.js',
    'biz/c': 'require-global/biz/c.js'
  }
})


define(function(require) {

  var test = require('../../../test')

  require('a')
  require('b')
  require('biz/c')

  test.assert(seajs.require('a') === require('a'), 'a')
  test.assert(seajs.require('b') === require('b'), 'b')
  test.assert(seajs.require('biz/c') === require('biz/c'), 'c')

  test.next()

})

