seajs.config({
  debug: true
})

var _require = typeof require === 'function' ? require : null
global.g_destroy = 0

define(function(require) {

  var test = require('../../../test')

  var a = require('./a')
  test.assert(a.name === 'a1', a.name)
  test.assert(global.g_destroy === 1, global.g_destroy)

  var moduleA = seajs.cache[require.resolve('./a')]
  test.assert(moduleA.destroy, 'destroy')

  moduleA.destroy()
  _require && (delete _require.cache[require.resolve('./a')])

  require.async('./a.js?v=2', function(a) {
    test.assert(a.name === 'a2', a.name)
    test.assert(global.g_destroy === 2, global.g_destroy)

    done()
  })

  function done() {
    this['g_destroy'] = undefined
    test.next()
  }

})

