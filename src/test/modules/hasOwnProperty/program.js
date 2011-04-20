define(function(require) {

  var test = require('test/test');
  var pass = false;

  var hasOwnProperty = require('./hasOwnProperty');
  var toString = require('./toString');

  test.assert(toString === null, 'should throw error when module does not exist.');
  
  test.print('DONE', 'info');

});
