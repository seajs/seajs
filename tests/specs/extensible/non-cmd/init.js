define(function(require) {

  var test = require('../../../test')
  var $ = require('jquery.easing')

  //var $2 = require('jquery')
  //test.assert($ === $2, $.jquery)

  test.assert($.jquery === '1.9.1', $.jquery)
  test.assert($.easing.name === 'easing', $.easing.name)

  test.assert(global.$ === $, 'this.$ === $')
  test.assert(global.jQuery === $, 'this.jQuery === $')

  global.$ = undefined
  global.jQuery = undefined

  test.next()

})

