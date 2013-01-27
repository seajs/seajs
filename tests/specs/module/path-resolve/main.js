define(function(require) {

  var test = require('../../../test')

  test.assert(require('./missing/missing').bogus === null, 'return null when module file is 404')
  test.assert(require('./nested/b/c/d').name === 'd', 'nested module identifier is allowed')
  test.assert(require('./relative/a').foo == require('./relative/b').foo, 'a and b share foo through a relative require')

  var a1 = require('./version/a.js?v=1.0')
  var a2 = require('./version/a.js?v=2.0')
  test.assert(a1.name === 'a', a1.name)
  test.assert(a2.name === 'a', a2.name)
  test.assert(a1.foo() === 'foo', a1.foo())
  test.assert(a2.foo() === 'foo', a2.foo())
  test.assert(a1.foo !== a2.foo, 'a1.foo !== a2.foo')

  test.next()

});
