define(function(require) {

  var test = require('../../test');

  document.cookie = 'seajs=1``1; path=/; expires=' + new Date(0)

  test.assert(document.getElementById('seajs-debug-console'), 'console div');
  test.done();
});
