
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
    'unit/test.html',

    'modules/config-alias',
    'modules/config-base',
    'modules/config-charset',
    'modules/config-debug/test.html'

  ]

  //exports.testCases = ['unit/test.html']

});

