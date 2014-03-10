define(function(require, exports) {

  exports.foo = 'a'

  setTimeout(function() {
    exports.foo2 = 'a2'
  }, 0)

});
