define(function(require) {

  var test = require('../../test');
  var passed;

  seajs.config({
    alias: {
      'jquery': 'jquery/1.6.1/jquery'
    }
  });

  try {
    seajs.config({
      alias: {
        'jquery': 'jquery/1.6.2/jquery'
      }
    });
    passed = true;
  } catch(ex) {
    passed = false;
  }

  test.assert(passed, 'Do not throw error when the alias config is conflicted');
  test.done();

});