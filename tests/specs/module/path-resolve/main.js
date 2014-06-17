define(function(require) {

  var test = require('../../../test')

  test.assert(require('./nested/b/c/d').name === 'd', 'nested module identifier is allowed')
  test.assert(require('./relative/a').foo == require('./relative/b').foo, 'a and b share foo through a relative require')


  // Node.js DO NOT support timestamp and 404 error
  if (typeof process !== 'undefined') {
    test.next()
    return
  }

  var a1 = require('./version/a.js?v=1.0')
  var a2 = require('./version/a.js?v=2.0')

  test.assert(a1.name === 'a', a1.name)
  test.assert(a2.name === 'a', a2.name)
  test.assert(a1.foo() === 'foo', a1.foo())
  test.assert(a2.foo() === 'foo', a2.foo())
  test.assert(a1.foo !== a2.foo, 'a1.foo !== a2.foo')


  // issues#839
  test.assert(require.resolve('./').indexOf('.js') === -1, require.resolve('./'))

  
  // issues#824
  var lang = 'not-existed'
  test.assert(require(lang) === void 0, 'i18n')

  require.async('./missing/missing', function(missing) {
    test.assert(missing.bogus === void 0, 'return undefined when module file is 404')
    test.next()
  })

});
