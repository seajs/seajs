
if (typeof define !== 'function') {
  this.define = function(fn) {
    fn(null, this);
  }
}

define(function(require, exports) {

  exports.testCases = [
    'unit/util-core'

    ,'modules/alias'
    ,'modules/checkPotentialErrors'
    ,'modules/configMap'
    ,'modules/cyclic'
    ,'modules/define'
    ,'modules/determinism'
    ,'modules/exactExports'
    ,'modules/exports'
    ,'modules/extend'
    ,'modules/hasOwnProperty'
    ,'modules/load'
    ,'modules/math'
    ,'modules/metadata'
    ,'modules/method'
    ,'modules/missing'
    ,'modules/monkeys'
    ,'modules/nested'
    ,'modules/preload'
    ,'modules/relative'
    ,'modules/simplest'
    ,'modules/transitive'
    ,'modules/version'

    ,'issues/anywhere'
    ,'issues/config-base'
    ,'issues/config-conflict'
    ,'issues/data-main'
    ,'issues/debug'
    ,'issues/ie-cache'
    ,'issues/inline-module'
    ,'issues/jsonp'
    ,'issues/load-css'
    ,'issues/load-deps'
    ,'issues/local-files'
    ,'issues/map'
    ,'issues/module-extend'
    ,'issues/multi-map'
    ,'issues/multi-use'
    ,'issues/multi-versions'
    ,'issues/no-conflict'
    ,'issues/onload'
    ,'issues/plugin-coffee'
    ,'issues/plugin-json'
    ,'issues/plugin-less'
    ,'issues/plugin-map'
    ,'issues/plugin-text'
    ,'issues/preload'
    ,'issues/remove-comments'
    ,'issues/require-extend'
    ,'issues/seajs-map'
    ,'issues/timestamp'

    ,'packages/math'

    ,'bootstrap/index'
  ];

  //exports.testCases = ['modules/inline'];

});
