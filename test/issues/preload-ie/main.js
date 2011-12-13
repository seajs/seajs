
define(function(require) {

  var test = require('../../test');

  require('./p');
  test.assert(P, P);
  test.done();

});
