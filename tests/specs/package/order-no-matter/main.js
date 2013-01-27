
seajs.config({
  base: '../'
})


define(function(require) {

  var test = require('../../../test')
  var program = require('package/order-no-matter/program')

  test.assert(program.result === 11, program.result)
  test.next()

});

