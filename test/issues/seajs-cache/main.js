define(function(require) {

  var test = require('../../test')
  var a = require('a')


  test.assert(a.name === 'a', a.name)


  test.done()

})
