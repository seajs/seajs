define(function(require) {

  var test = require('../../../test')

  seajs.config({
    alias: {
      'a': 'x'
    }
  })
  seajs.config({
    alias: {
      'a': 'y'
    }
  })

  test.assert(seajs.data.history.alias.length == 2)
  test.assert(seajs.data.history.alias[0].a == 'x')
  test.assert(seajs.data.history.alias[1].a == 'y')
  test.next()

})