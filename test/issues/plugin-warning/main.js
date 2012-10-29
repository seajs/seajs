define(function(require) {

  var test = require('../../test')
  var xx100 = require('./xx/1.0.0/xx.js')
  var xx120 = require('./xx/1.2.0/xx.js')

  test.assert(xx100.name === 'xx', xx100.name)
  test.assert(xx120.name === 'xx', xx120.name)
  test.assert(xx100.version === '1.0.0', xx100.name)
  test.assert(xx120.version === '1.2.0', xx120.name)

  test.done()
})
