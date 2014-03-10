define('b', ['b2'], function(require, exports) {
  exports.name = 'b'
  exports.b2 = require('b2').name
});
