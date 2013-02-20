define('./embedded/a2', function(require, exports) {
  exports.foo = require('./b2').foo
});

define('./embedded/a3', function(require, exports) {
  exports.foo = require('./b3').foo
});


define(function(require) {

  var test = require('../../../test')

  test.assert(require('./a2').foo === 'bar2', 'embedded code is ok')
  test.assert(require('./a3').foo === 'bar3', 'embedded code is ok')

  test.next()

});

