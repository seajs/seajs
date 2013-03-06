define(function(require) {

  var test = require('../../../test')

  var $ = require('jquery')
  require('angular_a')
  require('angular_b')

  test.assert($.jquery === '1.9.1', $.jquery)
  test.assert($.a === 'a', $.a)
  test.assert($.b === 'b', $.b)

  global.jQuery = undefined

  test.next()

})

