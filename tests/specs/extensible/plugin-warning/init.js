define(function(require) {

  var test = require('../../../test')
  var xx100 = require('./xx/1.0.0/xx.js')
  var xx120 = require('./xx/1.2.0/xx.js')

  test.assert(xx100.name === 'xx', xx100.name)
  test.assert(xx120.name === 'xx', xx120.name)
  test.assert(xx100.version === '1.0.0', xx100.name)
  test.assert(xx120.version === '1.2.0', xx120.name)

  var a12 = require('./zz/a-1.2.js')
  var a13 = require('./zz/a-1.3.js')

  test.assert(a12.name === 'a', a12.name)
  test.assert(a13.name === 'a', a13.name)
  test.assert(a12.version === '1.2', a12.name)
  test.assert(a13.version === '1.3', a13.name)


  var msg2 = global.consoleMsgStack.pop()
  var msg1 = global.consoleMsgStack.pop()

  test.assert(msg1.indexOf('This module has multiple versions:') === 0, 'console message')
  test.assert(msg2.indexOf('This module has multiple versions:') === 0, 'console message')

  test.next()

})
