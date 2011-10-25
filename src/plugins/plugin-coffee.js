
/**
 * @fileoverview The CoffeeScript plugin.
 */

define(function(require) {

  resolveCoffeeId(require.constructor);

});


function resolveCoffeeId(Require) {
  var _resolve = Require.prototype.resolve;

  Require.prototype.resolve = function(id, context) {
    if (/\.coffee$/.test(id)) {
      id += '#';
    }

    return _resolve.call(this, id, context);
  };
}
