define(function(require) {

  var test = require('../../test');

  try {
    require('./e');
    test.print('[PASS] ' + 'should not throw error.', 'pass');
  }
  catch(x) {
    test.print('[FAIL] ' + 'should not throw error.', 'fail');
  }

  test.done();

});
