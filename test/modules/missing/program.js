define(function(require) {

  var test = require('../../test');

  test.assert(require('bogus') === null, 'return null when module missing.');
  
  test.done();

});
