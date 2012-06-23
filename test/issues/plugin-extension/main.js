define(function(require) {

  var test = require('../../test')

  var a = require('./a.json')
  var b = require('./b.js')
  var b2 = require('./b.js?md5sum')


  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)
  test.assert(b2.name === 'b', b2.name)

  test.done()

})
