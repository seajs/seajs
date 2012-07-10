
;(function(factory) {

  if (typeof define === 'function') {
    define(factory)
  }
  else if (typeof exports !== 'undefined') {
    factory(require, exports)
  }
  else {
    factory(null, this)
  }

})(function(require, exports) {

  exports.testCases = [
    'unit/util'

    ,'modules/alias'
    ,'modules/config-map'
    ,'modules/cyclic'
    ,'modules/define'
    ,'modules/exact-exports'
    ,'modules/exports'
    ,'modules/extend'
    ,'modules/hasOwnProperty'
    ,'modules/load'
    ,'modules/math'
    ,'modules/method'
    ,'modules/missing'
    ,'modules/monkeys'
    ,'modules/nested'
    ,'modules/preload'
    ,'modules/relative'
    ,'modules/require-async'
    ,'modules/simplest'
    ,'modules/transitive'
    ,'modules/version'

    ,'issues/alias-override'
    ,'issues/alias-shortcuts'
    ,'issues/anonymous'
    ,'issues/anywhere'
    ,'issues/charset'
    ,'issues/circular-detect'
    ,'issues/combo-use'
    ,'issues/compiling-module'
    ,'issues/config-base'
    ,'issues/config-conflict'
    ,'issues/data-main'
    ,'issues/debug'
    ,'issues/debug-using-map'
    ,'issues/define-override'
    ,'issues/derived-module'
    ,'issues/dom-ready'
    ,'issues/duplicate-load'
    ,'issues/ie-cache'
    ,'issues/inline-module'
    ,'issues/invalid-deps'
    ,'issues/jsonp'
    ,'issues/load-css'
    ,'issues/load-deps'
    ,'issues/local-files'
    ,'issues/map'
    ,'issues/methods-chain'
    ,'issues/module-extend'
    ,'issues/multi-map'
    ,'issues/multi-preload'
    ,'issues/multi-use'
    ,'issues/multi-use-same'
    ,'issues/multi-use-tpl'
    ,'issues/multi-versions'
    ,'issues/no-conflict'
    ,'issues/no-request'
    ,'issues/onload'
    ,'issues/parse-deps'
    ,'issues/plugin-coffee'
    ,'issues/plugin-combo'
    ,'issues/plugin-debug'
    ,'issues/plugin-extension'
    ,'issues/plugin-json'
    ,'issues/plugin-less'
    ,'issues/plugin-text'
    ,'issues/preload'
    ,'issues/protocol-80'
    ,'issues/public-api'
    ,'issues/remove-comments'
    ,'issues/require-async'
    ,'issues/seajs-find'
    ,'issues/seajs-importStyle'
    ,'issues/seajs-log'
    ,'issues/seajs-map'
    ,'issues/seajs-modify'
    ,'issues/slash-in-map'
    ,'issues/timestamp'
    ,'issues/un-correspondence'
    ,'issues/utf8-in-gbk'
    ,'issues/x-ua-compatible'

    ,'runtime/math'
    ,'runtime/order-no-matter'

    ,'bootstrap/index'
  ]

  //exports.testCases = ['issues/multi-use']

})
