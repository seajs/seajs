define(function(require) {

  var test = require('../../test')
  var cookie = require('cookie')

  test.assert(typeof cookie === 'function', typeof cookie)
  test.assert(cookie.defaults, 'cookie.defaults')

  test.done()

})
