define(function(require) {

  var test = require('../../test');

  test.assert(document.getElementById('seajs-debug-console'), 'console div');
  test.done();
});
