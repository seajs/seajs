define(function(require, exports) {

  var test = require('../../../test')

  test.assert(exports.monkey === undefined, 'exports.monkey is undefined')
  var a = require('./a')
  test.assert(exports.monkey === 10, 'monkeys are permitted')

  test.next()

});

