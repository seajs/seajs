define(function(require) {

  var test = require('../../../test')

  var a = require('./a')
  var b = require('./b')
  var c = require('./c')

  test.assert(a.name === 'a', 'a is ok')
  test.assert(b.name === 'b', 'b is ok')
  test.assert(c.name === 'c', 'c is ok')

  test.next()

});
