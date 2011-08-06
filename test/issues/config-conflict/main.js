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
    passed = false;
  } catch(ex) {
    passed = true;
  }

  test.assert(passed, 'throw error when the alias config is conflicted.');
  test.done();

});