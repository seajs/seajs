define('a2', null, function(require, exports) {
  exports.foo = require('./b2').foo
});

define('a3', null, function(require, exports) {
  exports.foo = require('./b3').foo
});
