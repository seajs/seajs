define(function(require, exports, mod) {

  var test = require('../../../test')
  var a = require('./a')

  test.assert(mod.uri.indexOf('?t=20130203') > 0, mod.uri)
  test.assert(a.name === 'a-debug', a.name)

  test.next()

});

