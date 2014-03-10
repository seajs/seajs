
seajs.config({
  base: './define'
})


define(function(require) {

  var test = require('../../../test')

  test.assert(require('define-a').name === 'a', 'define(id, deps, fn)')
  test.assert(require('./b').name === 'b', 'define(deps, fn)')
  test.assert(require('./c').name === 'c', 'define(fn)')
  test.assert(require('define-d').name === 'd', 'define(id, fn)')
  test.assert(require('define-e').name === 'e', 'define(id, object)')
  test.assert(require('./f').name === 'f', 'define(object)')
  test.assert(require('define-g').name === 'g', 'define(id, deps, fn, more)')

  test.next()

});

