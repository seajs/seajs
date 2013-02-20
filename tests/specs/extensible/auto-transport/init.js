define(function(require) {

  var test = require('../../../test')
  var $ = require('./jquery')
  var cookie = require('./jquery.cookie')

  test.assert($.fn, '$.fn')
  test.assert(typeof cookie === 'function', typeof cookie)
  test.assert(cookie.defaults, 'cookie.defaults')

  // clean
  this['jQuery'] = this.$ = undefined

  test.next()

})
