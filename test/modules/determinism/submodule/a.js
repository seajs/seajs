define(function(require) {

  var test = require('../../../test');

  try {
    var a = require('a')
    test.assert(a === null, 'require() does not fall back to relative modules when absolutes are not available.')
  }
  catch(ex) {
    test.assert(true, 'Should throw error in node environment.');
  }
  
});
