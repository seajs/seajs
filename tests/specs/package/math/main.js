
seajs.config({
  base: './math/'
})


define(function(require) {

  var test = require('../../../test')
  var program = require('program')

  test.assert(program.result === 11, program.result)
  test.next()

});

