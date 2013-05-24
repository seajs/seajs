
seajs.config({
  base: '../'
})


define(function(require) {

  var test = require('../../../test')
  var program = require('package/math/program')

  test.assert(program.result === 11, 'math program')
  test.next()

});

