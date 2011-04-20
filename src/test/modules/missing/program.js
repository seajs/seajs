module.declare(['test/test'], function(require) {

  var test = require('test/test');

  try {
    require('bogus');
    test.print('FAIL require throws error when module missing.', 'fail');
  } catch (x) {
    test.print('PASS require throws error when module missing.', 'pass');
  }

  test.print('DONE', 'info');

});
