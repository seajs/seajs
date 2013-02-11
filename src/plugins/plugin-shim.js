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
  var shimConfig = {}

  function parseConfig(data) {
    each(data.shim, function(item, key) {
      shimConfig[key] = item
      if (!item.match) {
        item.match = seajs.resolve(key)
      }
    })
  }

  seajs.on("config", parseConfig)

  // Parse config here to make previous shim config available
  parseConfig(seajs.config.data)

  seajs.on("initialized", function(mod) {
    var uri = mod.uri

    each(shimConfig, function(item) {
      var deps = item.deps

      if (deps && match(item, uri)) {
        for (var i = 0; i < deps.length; i++) {
          mod.dependencies.push(deps[i])
        }
        return false
      }

    })
  })

  seajs.on("compile", function(mod) {
    var uri = mod.uri

    each(shimConfig, function(item) {
      var exports = item.exports

      if (exports && match(item, uri)) {
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

  function match(item, uri) {
    var match = item.match
    return match.test ? match.test(uri) : uri === match
  }

  function isFunction(obj) {
    return typeof obj === "function"
  }

})(seajs, this);

