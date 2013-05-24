define(function(require) {

  var test = require('../../../test')
  var utf8 = require('./utf8-module')

  test.assert(utf8.name === '中文', utf8.name)
  test.next()

});

