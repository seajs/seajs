
if (typeof define !== 'function') {
  this.define = function(fn) {
    fn(null, this);
  }
}

define(function(require, exports) {

  exports.testCases = [
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
    ,'modules/extend'
    ,'modules/configMap'

    ,'packages/math'

    ,'unit/util-helper'

    ,'issues/config-base'
    ,'issues/ie-cache'
    ,'issues/load-css'
    ,'issues/local-files'
    ,'issues/no-conflict'
    ,'issues/remove-comments'
    ,'issues/multi-use'
    ,'issues/jsonp'

    ,'bootstrap/index'
  ];

  exports.testCases = ['modules/configMap'];

});
