define(function(require) {

  var test = require('../../test')

  var a = require('./a')
  var b = require('./b')

  test.assert(a.$, 'a.$')
  test.assert(b.$, 'b.$')
  test.assert(a.$ === b.$, 'a.$ === b.$')

  test.done()

})
