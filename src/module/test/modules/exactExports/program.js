module.declare(function (require, exports) {

  var test = require('test/test');
  var a = require('./a');

  test.assert(a.program() === exports, 'exact exports.');
  test.print('DONE', 'info');

});
