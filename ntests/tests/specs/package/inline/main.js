define('./inline/a2', null, function(require, exports) {
  exports.foo = require('./b2').foo
});

define('./inline/a3', null, function(require, exports) {
  exports.foo = require('./b3').foo
});


define(function(require) {

  var test = require('../../../test')

  test.assert(require('./a2').foo === 'bar2', 'inline code is ok')
  test.assert(require('./a3').foo === 'bar3', 'inline code is ok')

  test.next()

});

