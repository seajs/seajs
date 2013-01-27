define(function(require, exports, mod) {

  var Module = mod.constructor

  Module.prototype.getFilename = function() {
    var uri = this.uri
    var parts = uri.split('/')
    return parts[parts.length - 1]
  }

  exports.destroy = function() {
    delete Module.getFilename
  }

});

