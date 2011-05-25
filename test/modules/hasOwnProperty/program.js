define(function(require) {

  var test = require('../../test');

  var hasOwnProperty = require('./hasOwnProperty');
  var toString = require('./toString');

  test.assert(toString === null, 'should return null when module does not exist.');
  test.done();

});
