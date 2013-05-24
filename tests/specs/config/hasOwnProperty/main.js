
seajs.config({
  base: './hasOwnProperty',
  alias: {
  }
})


define(function(require) {

  var test = require('../../../test')

  var hasOwnProperty = require('hasOwnProperty')
  var toString = require('toString')

  test.assert(require('a').name === 'a', 'a')
  test.assert(hasOwnProperty.name === 'hasOwnProperty', hasOwnProperty.name)
  test.assert(toString.name === 'toString', toString.name)

  test.next()

});

