define(function(require) {

  var test = require('../../test');

  try {
    var bogus = require('bogus');
  }
  catch(ex) { // for node
    bogus = null;
  }

  test.assert(bogus === null, 'return null when module missing.');
  test.done();

});
