module.declare(function(require, exports) {

  var a = require('./a');
  var test = require('test/test');

  test.assert(exports.monkey === 10, 'monkeys permitted.');
  test.print('DONE', 'info');

});
