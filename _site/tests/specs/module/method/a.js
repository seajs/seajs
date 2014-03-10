define(function(require, exports) {

  var global = this

  exports.foo = function () {
    return this
  }

  exports.setX = function (x) {
    this.x = x
  }

  exports.getX = function () {
    return this.x
  }

  exports.getXFromExports = function () {
    return exports.x
  }

  exports.getThis = function() {
    return global
  }

});
