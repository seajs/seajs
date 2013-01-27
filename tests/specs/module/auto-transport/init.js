define(function(require) {

  var test = require('../../test')
  var $ = require('jquery')
  var cookie = require('cookie')

  test.assert($.fn, '$.fn')
  test.assert(typeof cookie === 'function', typeof cookie)
  test.assert(cookie.defaults, 'cookie.defaults')

  test.done()

})
