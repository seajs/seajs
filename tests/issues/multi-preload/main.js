

define(function(require) {

  var test = require('../../test');

  test.assert(A === true, 'preload a.js is ok');
  test.assert(B === true, 'preload b.js is ok');

  test.done();
});
