define(['test/test'], function(require) {

  var test = require('test/test');

  test.assert(require('bogus') === null, 'return null when module missing.');
  
  test.print('DONE', 'info');

});
