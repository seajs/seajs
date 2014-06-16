define(['./a'], function(require) {

  var test = require('../../../test')

  test.assert(require(0).a === 'a', 'use index')
  test.next()

});
