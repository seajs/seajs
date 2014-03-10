define('a2', ['a'], function(require, exports) {
  exports.name = require('a').name + '2'
});

define('a', ['a2'], function(require, exports) {
  exports.name = 'a'
  exports.a2 = require('a2').name
});
