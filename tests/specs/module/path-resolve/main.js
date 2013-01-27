define(function(require) {

  var test = require('../../../test')

  test.assert(require('./nested/b/c/d').foo() === 1, 'nested module identifier is allowed')
  test.assert(require('./relative/a').foo == require('./relative/b').foo, 'a and b share foo through a relative require')

  test.next()

});
