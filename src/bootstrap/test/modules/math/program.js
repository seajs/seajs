S.declare(['test', 'increment'], function(require, exports) {

  var test = require('test');
  var inc = require('increment').increment;

  test.assert(inc(1) === 2, 'inc(1) should equal to 2');
  test.print('DONE', 'info');

});
