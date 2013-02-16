
seajs.config({
  charset: function(url) {
    if (url.indexOf('a.js') > 0) {
      return 'gbk'
    }
    return 'utf-8'
  }
})


define(function(require) {

  var test = require('../../../test')
  var isNode = typeof process !== 'undefined'
  var isPhantomJS = !isNode && navigator.userAgent.indexOf('PhantomJS') > 0

  var a = require('./a.js')
  var b = require('./b.js')

  isNode || isPhantomJS ?
      test.assert(true, 'PhantomJS DO NOT support GBK charset') :
      test.assert(a.message === '你好 GBK', 'GBK')

  test.assert(b.message === '你好 UTF-8', 'UTF-8')

  test.next()

});

