define(function(require) {

  var test = require('../../test')
  var zzz = require('zzz')


  test.assert(zzz.name === 'zzz', zzz.name)
  test.done()

})
