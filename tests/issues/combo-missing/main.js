define(function(require) {

  var test = require('../../test')
  var a = require('./a')
  var b = require('./b')
  var c = require('./c')

  test.assert(a.name == 'a', a.name)
  test.assert(b.name == 'b', b.name)

  //console.log(c)
  test.assert(c === null, typeof c)

  test.done()

})
