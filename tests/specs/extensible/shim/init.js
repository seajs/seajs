define(function(require) {

  var test = require('../../../test')
  var $ = require('jquery.easing')

  test.assert($.easing.name === 'easing', $.easing.name)
  test.assert($.jquery === '1.9.1', $.jquery)

  test.assert(global.$ === $, 'this.$ === $')
  test.assert(global.jQuery === $, 'this.jQuery === $')

  global.$ = undefined
  global.jQuery = undefined

  test.next()

})

