define(function(require) {

  var test = require('../../../test')

  var a = require('./a')
  test.assert(a.foo() === a, 'calling a module member')

  var foo = a.foo
  test.assert(foo() === (function () {
    return this
  })(), 'members not implicitly bound')

  a.setX(10)
  test.assert(a.getX() === 10, 'get and set')
  test.assert(a.getXFromExports() === a.getX(), 'get from exports')

  test.next()

});
