
seajs.config({
  base: './combo-map/'
})

seajs.on('fetch', function(data) {
  data.requestUri = data.uri.replace(/\/(a|b|c)\.js/, '/combo.js')
})


define(function(require) {

  var test = require('../../../test')
  var a = require('a')
  var b = require('b')
  var c = require('c')

  test.assert(a.name == 'a', a.name)
  test.assert(b.name == 'b', b.name)
  test.assert(c === void 0, 'return undefined when c is not found')

  test.next()

})
