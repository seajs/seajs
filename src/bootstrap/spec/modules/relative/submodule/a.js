
S.using('./b')
 .declare(function(require, exports) {

  exports.foo = require('./b').foo;

});
