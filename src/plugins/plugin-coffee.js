

/**
 * @fileoverview The CoffeeScript plugin.
 */

define('plugin-coffee', function(require) {

  var CoffeeScript = require('coffee');
  var RP = require.constructor.prototype;


  // extend loader
  extendCoffeeResolve();
  extendCoffeeLoad();


  function extendCoffeeResolve() {

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
