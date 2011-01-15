module.declare(['test'], function(require) {

  var test = require('test');

  try {
    require('bogus');
    test.print('FAIL require throws error when module missing.', 'fail');
  } catch (x) {
    test.print('PASS require throws error when module missing.', 'pass');
  }

  test.print('DONE', 'info');

});
