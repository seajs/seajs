/**
 * Add shim config for configuring the dependencies and exports for
 * older, traditional "browser globals" scripts that do not use define()
 * to declare the dependencies and set a module value.
 */
(function(seajs, global) {

  var Module = seajs.Module

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
        var src = item.src ? seajs.resolve(item.src) : ""

        // Set dependencies
        if (src && item.deps) {
          var mod = new Module(src)
          seajs.cache[src] = mod
          mod.dependencies = item.deps
        }

        // Define the proxy module
        define(id, src ? [src] : item.deps || [],
            function() {
              var exports = item.exports
              return typeof exports === "function" ? exports() :
                  typeof exports === "string" ? global[exports] :
                      exports
            })
      })(shim[id])
    }
  }


  define(seajs.dir + "plugin-shim", [], {})

})(seajs, typeof global === "undefined" ? this : global);

