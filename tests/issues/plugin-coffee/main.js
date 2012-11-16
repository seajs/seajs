define(function(require) {

  var test = require('../../test')

  var a = require('./a2.coffee')
  var b = require('./b.coffee')
  var c = require('coffee!./c.coffee')


  test.assert(a.name === 'a' && b.name === 'b' && c.name === 'c', 'coffee ok')
  test.done()

})
