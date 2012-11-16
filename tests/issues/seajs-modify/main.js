define(function(require) {

  var test = require('../../test')
  var a = require('./a')
  var b = require('./b')

  // modify after `compile`
  seajs.modify('./a', function(require, exports) {
    exports.getName = function() {
      return this.name
    }
  })

  test.assert(a.name === 'a', a.name)
  test.assert(a.getName() === 'a', a.getName())

  test.assert(b.name === 'b', b.name)
  test.assert(b.getName() === 'b', b.getName())

  test.done()

})
