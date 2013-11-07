
seajs.config({
  base: './define'
})


define(function(require) {

  var test = require('../../../test')
  var msg = ''

  test.assert(require('define-a').name === 'a', 'define(id, deps, fn)')
  test.assert(require('./b').name === 'b', 'define(deps, fn)')
  test.assert(require('./c').name === 'c', 'define(fn)')
  test.assert(require('define-d').name === 'd', 'define(id, fn)')
  test.assert(require('define-e').name === 'e', 'define(id, object)')
  test.assert(require('./f').name === 'f', 'define(object)')
  test.assert(require('define-g').name === 'g', 'define(id, deps, fn, more)')
  console.warn = function() {
    msg = arguments
  }
  seajs.config({ debug: true })
  test.assert(require('define-id-path-mismatched') === null, 'id & path mismatched')
  test.assert(msg !== '', 'id & path mismatched msg is consoled')
  msg = ''
  test.assert(require('define-without-arg') === null, 'define without arguments')
  test.assert(msg === '', 'define without arguments do not trigger mismatched rule')
  msg = ''
  require('non-js.css')
  test.assert(msg === '', 'non-js do not trigger mismatched rule')
  seajs.config({ debug: false })

  test.next()

});

