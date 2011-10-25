
/**
 * @fileoverview The CoffeeScript plugin.
 */

define(function(require) {

  var CoffeeScript = require('coffee');
  var RP = require.constructor.prototype;


  // extend loader
  extendCoffeeResolve();
  extendCoffeeLoad();


  function extendCoffeeResolve() {
    var _resolve = RP.resolve;

    RP.resolve = function(id, context) {
      if (isCoffee(id)) {
        id += '#';
      }
      return _resolve.call(this, id, context);
    };
  }


  function extendCoffeeLoad() {
    var _load = RP.load;

    RP.load = function(url, callback, charset) {
      if (isCoffee(url)) {
        return CoffeeScript.load(url, callback);
      }
      return _load(url, callback, charset);
    };
  }


  function isCoffee(filepath) {
    return /\.coffee(?:$|\?)/.test(filepath);
  }

});
