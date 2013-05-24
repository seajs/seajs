define(function(require, exports) {

  var bogus

  try {
    bogus = require('bogus')
  }
  catch (ex) { // for node
    bogus = null
  }

  exports.bogus = bogus

});

