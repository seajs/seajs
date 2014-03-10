seajs.config({
  alias: {
    'a': 'require-global/a.js',
    'b': 'require-global/b.js',
    'biz/c': 'require-global/biz/c.js'
  }
})


define(function(_require) {

  var test = _require('../../../test')

  _require('a')
  _require('b')
  _require('biz/c')

  test.assert(seajs.require('a') === _require('a'), 'a')
  test.assert(seajs.require('b') === _require('b'), 'b')
  test.assert(seajs.require('biz/c') === _require('biz/c'), 'c')


  if (typeof require === 'function') {
    require('./combo.js')
    done()
  } else {
    seajs.request('./require-global/combo.js', done)
  }

  function done() {
    test.assert(seajs.require('combo-a').name === 'a')
    test.assert(seajs.require('combo-b').name === 'b')
    test.assert(seajs.require('combo-c').name === 'c')
    test.next()
  }

})

