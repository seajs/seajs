
/**
 * @fileoverview Run test cases in node environment.
 * @author lifesinger@gmail.com (Frank Wang)
 */

define(function(require) {

  var testCases = require('./config').testCases;

  testCases.forEach(function(test){
    require('./' + test + '/program.js');
  });

});
