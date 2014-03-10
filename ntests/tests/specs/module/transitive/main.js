define(function(require) {

  var test = require('../../../test')

  test.assert(require('./a').foo() === 'bar', 'transitive')
  test.next()

});
