define('./a2', function(require, exports) {

  exports.foo = require('./b').foo;

});

define('./a3', function(require, exports) {
  exports.foo = require('./b2').foo;
});
