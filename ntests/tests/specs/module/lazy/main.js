define(function(require) {

  var test = require('../../../test')

  var a = require('./a')
  test.assert(a.name === 'a', a.name)
  test.assert(a.count === 0, a.count)

  var b = require('./b')
  test.assert(b.name === 'b', b.name)
  test.assert(a.count === 1, a.count)

  test.next()

});
