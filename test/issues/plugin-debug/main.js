define(function(require) {

  var test = require('../../test');

  document.cookie = 'seajs=0``0; path=/; expires=' + new Date(0)

  test.assert(document.getElementById('seajs-debug-console'), 'console div');
  test.done();
});
