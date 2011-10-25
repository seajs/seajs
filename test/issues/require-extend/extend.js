define(function(require) {

  var Require = require.constructor;
  var _resolve = Require.prototype.resolve;

  Require.prototype.resolve = function(id, context) {
    if (/\.coffee$/.test(id)) {
      id += '#';
    }
    return _resolve.call(this, id, context);
  };

});
