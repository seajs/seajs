
define('biz/a', ['biz/a2'], function(require, exports) {
  exports.name = require('biz/a2').name
});

define('biz/a2', [], function(require, exports) {
  exports.name = 'a'
});

define('biz/b', [], function(require, exports) {
  exports.name = 'b'
});

define('biz/sub/c', [], function(require, exports) {
  exports.name = 'c'
});
