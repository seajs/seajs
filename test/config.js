
if (typeof define !== 'function') {
  this.define = function(fn) {
    fn(null, this);
  }
}

define(function(require, exports) {

  exports.testCases = [
    'modules/simplest'
    ,'modules/math'
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
    ,'modules/define'

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
    ,'issues/seajs-map'
    ,'issues/timestamp'
    ,'issues/module-extend'
    ,'issues/config-conflict'
    ,'issues/preload'
    ,'issues/inline-module'
    ,'issues/anywhere'
    //,'issues/modules'

    ,'bootstrap/index'
  ];

  //exports.testCases = ['modules/inline'];

});
