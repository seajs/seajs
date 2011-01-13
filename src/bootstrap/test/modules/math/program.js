S.declare(['test', 'increment'], function(require, exports) {

  var test = require('test');
  var inc = require('increment').increment;

  test.assert(inc(1) === 2, 'inc(1) should equal to 2');

  var notExcuted = true;
  try {
    require('math');
    notExcuted = false;
  } catch(x) {
  }
  test.assert(notExcuted, 'Throws error, when required id can not be found in dependencies');

  test.print('DONE', 'info');

});
