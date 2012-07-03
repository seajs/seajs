define(function (require, exports) {

  var test = require('../../test')
  var a = require('./a')

  test.assert(a.program() === exports, 'exact exports')
  test.done()

})
