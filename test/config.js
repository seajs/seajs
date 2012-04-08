
(function(factory) {

  if (typeof define === 'function') {
    define(factory);
  }
  else if (typeof exports !== 'undefined') {
    factory(require, exports);
  }
  else {
    factory(null, this);
  }

})(function(require, exports) {

  exports.testCases = [
    'unit/util'

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

    ,'issues/anonymous'
    ,'issues/anywhere'
    ,'issues/charset'
    ,'issues/combo-use'
    ,'issues/config-base'
    ,'issues/config-conflict'
    ,'issues/data-main'
    ,'issues/debug'
    ,'issues/duplicate-load'
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
    ,'issues/parse-deps'
    ,'issues/plugin-coffee'
    ,'issues/plugin-json'
    ,'issues/plugin-less'
    ,'issues/plugin-map'
    ,'issues/plugin-text'
    ,'issues/preload'
    ,'issues/preload-ie'
    ,'issues/remove-comments'
    //,'issues/require-async'
    ,'issues/require-extend'
    ,'issues/seajs-map'
    ,'issues/timestamp'
    ,'issues/un-correspondence'

    ,'packages/base'
    ,'packages/math'

    ,'bootstrap/index'
  ];

  //exports.testCases = ['modules/inline'];

});
