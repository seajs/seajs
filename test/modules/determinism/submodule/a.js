define(function(require) {

  var test = require('../../../test');

  try {
    test.assert(require('a') === null, 'require() does not fall back to relative modules when absolutes are not available.')
  }
  catch(ex) {
    test.assert(true, 'Should throw error in node environment.');
  }
  
});
