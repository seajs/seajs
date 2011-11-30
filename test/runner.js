/**
 * Run test cases in node environment.
 * @author lifesinger@gmail.com (Frank Wang)
 */

var test = require('./test');
var testCases = require('./config').testCases;

var excludes = [
  'modules/alias'
  ,'modules/load'
  ,'modules/metadata'
  ,'modules/checkPotentialErrors'
];

testCases = testCases.filter(function(testCase) {
  return testCase.indexOf('modules/') === 0 &&
      excludes.indexOf(testCase) === -1;
});


test.next = function() {
  var testCase;

  while ((testCase = testCases.shift())) {
    require(path.join(__dirname, testCase, 'program.js'));
  }
};


// go
test.next();
