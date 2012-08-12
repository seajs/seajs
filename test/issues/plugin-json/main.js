define(function(require) {

  var test = require('../../test')
  var b = require('./b.json')
  var c = require('./c.json?t=30222')

  test.assert(b.name === 'b', b.name)
  test.assert(b.foo === "'bar'\"", b.foo)
  test.assert(c.name === 'c', c.name)
  test.assert(typeof c.n === 'number', typeof c.n)

  // test resolve
  test.assert(/\.json$/.test(require.resolve('path/to/d.json')), require.resolve('path/to/d.json'))
  test.assert(require.resolve('d') === require.resolve('path/to/d.json'), require.resolve('d'))
  test.assert(require.resolve('json!d') === require.resolve('d'), require.resolve('json!d'))

  test.done()
});
