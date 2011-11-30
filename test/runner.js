/**
 * Run test cases in node environment.
 * @author lifesinger@gmail.com (Frank Wang)
 */

var path = require('path');
require('../lib/sea-node');


var test = require('./test');
var testCases = require('./config').testCases;

var excludes = [
  'modules/configMap'
  ,'modules/define'
  ,'modules/preload'
];

testCases = testCases.filter(function(testCase) {
  return testCase.indexOf('modules/') === 0 &&
      excludes.indexOf(testCase) === -1;
});


test.next = function() {
  var testCase;

  while ((testCase = testCases.shift())) {
    test.print(testCase, 'info');
    require(path.join(__dirname, testCase, 'program.js'));
  }
};


// go
test.next();
