define('a2', function(require, exports) {
  exports.foo = require('./b2').foo
});

define('a3', function(require, exports) {
  exports.foo = require('./b3').foo
});
