define(function(require, exports) {

  var test = require('../../../test')

  test.assert(require('./a').foo === 'a', 'exports.foo')
  test.assert(require('./a').foo2 === undefined, 'setTimeout is async')

  test.assert(require('./b').foo === 'b', 'module.exports = {}')
  test.assert(require('./c').foo === 'c', 'return {}')
  test.assert(require('./d').foo === 'd', 'define({})')

  test.assert(require('./e') === 'e', 'define(string)')

  test.assert(require('./f')[0] === 'f', 'define([])')
  test.assert(require('./f')[1] === '.', 'define([])')
  test.assert(require('./f')[2] === 'js', 'define([])')

  test.assert(require('./g') === true, 'define(true)')
  test.assert(require('./h') === false, 'define(false)')

  test.assert(require('./i') === null, 'define(null)')
  test.assert(require('./j') === void 0, 'define(undefined)')
  test.assert(require('./k') === void 0, 'define()')

  test.next()

});
