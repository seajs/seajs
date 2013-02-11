define(function(require) {

  var test = require('../../../test')
  var $ = require('jquery.easing')

  test.assert($.easing.name === 'easing', $.easing.name)
  test.assert($.jquery === '1.9.1', $.jquery)

  test.assert(this.$ === $, 'this.$ === $')
  test.assert(this.jQuery === $, 'this.jQuery === $')

  this.$ = undefined
  this.jQuery = undefined

  test.next()

})

