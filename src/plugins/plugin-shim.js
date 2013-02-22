/**
 * Add shim config for configuring the dependencies and exports for
 * older, traditional "browser globals" scripts that do not use define()
 * to declare the dependencies and set a module value.
 */
(function(seajs, global) {

  // seajs.config( {
  // shim: {
  //   "jquery": {
  //     exports: "jQuery" or function
  //   },
  //   "jquery.plugins": {
  //     // URI matches such as jquery.easing.js, jquery.keystop.js
  //     match: /jquery\.[a-z].*\.js/,
  //     deps: ["jquery"]
  //   }
  // })
  var configData = seajs.config.data


  seajs.on("initialized", function(mod) {
    var uri = mod.uri

    each(configData.shim, function(item) {
      var deps = item.deps

      if (deps && match(item, uri)) {
        for (var i = 0; i < deps.length; i++) {
          mod.dependencies.push(deps[i])
        }
        return false
      }

    })
  })

  seajs.on("execute", function(mod) {
    var uri = mod.uri

    each(configData.shim, function(item, key) {
      var exports = item.exports

      if (exports && match(item, uri, key)) {
        mod.exports = isFunction(exports) ? exports() : global[exports]
        return false
      }

    })
  })


  // Helpers

  function each(obj, fn) {
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (fn(obj[p], p, obj) === false) {
          break
        }
      }
    }
  }

  function match(item, uri, key) {
    var match = item.match || (item.match = seajs.resolve(key))
    return match.test ? match.test(uri) : uri === match
  }

  function isFunction(obj) {
    return typeof obj === "function"
  }

})(seajs, this);

