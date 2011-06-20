define(function(require, exports, module) {

  var Module = module.constructor;

  Module.prototype.filename = function() {
    var id = this.id;
    var parts = id.split('/');
    return parts[parts.length - 1];
  };

});
