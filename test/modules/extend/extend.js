define(function(require, exports, module) {

  var Module = module.constructor;

  Module.prototype._filename = function() {
    var uri = this.uri;
    var parts = uri.split('/');
    return parts[parts.length - 1];
  };

});
