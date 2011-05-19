
if (typeof define !== 'function') {
  this.define = function(fn) {
    fn(null, this);
  }
}

define(function(require, exports) {

  var testCases = [
    'modules/math'
    ,'modules/cyclic'
    ,'modules/relative'
    ,'modules/determinism'
    ,'modules/exactExports'
    ,'modules/hasOwnProperty'
    ,'modules/method'
    ,'modules/missing'
    ,'modules/monkeys'
    ,'modules/nested'
    ,'modules/transitive'
    ,'modules/alias'
    ,'modules/version'
    ,'modules/load'
    ,'modules/metadata'
    ,'modules/exports'
    ,'modules/checkPotentialErrors'

    ,'packages/math'
  ];
  //testCases = ['modules/alias'];

  exports.testCases = testCases;

});
