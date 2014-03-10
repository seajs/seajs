
seajs.config({
  base: './override'
})


define(function(require) {

  var test = require('../../../test')
  var a = require('a')

  test.assert(a.name === 'a', 'do NOT override existed module')
  test.next()

});

