define(function(require) {

  require('./config')
  var test = require('../../test')

  test.assert(this.G === 1, typeof this.G)
  test.done()

})
