
(function(factory) {

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
      'specs/util-events/test.html'
    , 'specs/util-path/test.html'

    , 'specs/config-alias/test.html'
    , 'specs/config-base'
    , 'specs/config-charset'
    , 'specs/config-debug/test.html'
    , 'specs/config-map'

  ]

  //exports.testCases = ['unit/test.html']

});

