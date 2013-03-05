/**
 * Add shim config for configuring the dependencies and exports for
 * older, traditional "browser globals" scripts that do not use define()
 * to declare the dependencies and set a module value.
 */
(function(seajs, global) {

  // seajs.config({
  // shim: {
  //   "jquery": {
  //     src: "lib/jquery.js",
  //     exports: "jQuery" or function
  //   },
  //   "jquery.easing": {
  //     src: "lib/jquery.easing.js",
  //     deps: ["jquery"]
  //   }
  // })

  seajs.on("config", onConfig)
  onConfig(seajs.config.data)

  function onConfig(data) {
    if (!data) return
    var shim = data.shim

    for (var id in shim) {
      (function(item) {

        // Set dependencies
        item.deps && define(item.src, item.deps)

        // Define the proxy cmd module
        define(id, [item.src], function() {
          var exports = item.exports
          return typeof exports === "function" ? exports() :
              typeof exports === "string" ? global[exports] :
                  exports
        })

      })(shim[id])
    }
  }

})(seajs, typeof global === "undefined" ? this : global);

