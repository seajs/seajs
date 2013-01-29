define(function(require) {

  var test = require('../../../test')
  require('./invalid')

  test.assert(('' in seajs.cache) === false, 'invalid dependencies should be removed')
  test.next()

});

