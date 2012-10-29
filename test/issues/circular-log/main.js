define(function(require) {

  var test = require('../../test')

  test.assert(require('./a').name === 'a', 'should print out circular log info')
  test.assert(require('./x').name === 'x', 'should print out circular log info')
  test.assert(require('./s').name === 's', 'should print out circular log info')

  test.done()

})
