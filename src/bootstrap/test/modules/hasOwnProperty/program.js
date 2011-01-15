module.declare(['test', 'hasOwnProperty', 'toString'], function(require) {

  var hasOwnProperty = require('hasOwnProperty');
  var toString = require('toString');
  var test = require('test');

  test.print('DONE', 'info');

});
