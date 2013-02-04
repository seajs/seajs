/**
 * config.js - The configuration for the loader
 */

var configData = {
  // The root path to use for id2uri parsing
  base: (function() {
    var ret = dirname(loaderUri)

    // If loaderUri is `http://test.com/libs/seajs/1.0.0/sea.js`, the baseUri
    // should be `http://test.com/libs/`
    var m = ret.match(/^(.+\/)seajs\/\d[^/]+\/$/)
    if (m) {
      ret = m[1]
    }

    return ret
  })(),

  // The charset for requesting files
  charset: "utf-8"

  // debug: false - Debug mode
  // alias - The shorthand alias for module id
  // vars - The {xxx} variables in module id
  // map - An array containing rules to map module uri
  // preload - Modules that are needed to load before all other modules
}

seajs.config = function(obj) {
  for (var key in obj) {
    if (hasOwn(obj, key)) {

      var prev = configData[key]
      var curr = obj[key]

      if (prev && (key === "alias" || key === "vars")) {
        for (var k in curr) {
          if (hasOwn(curr, k)) {

            var val = curr[k]
            if (k in prev) {
              checkConfigConflict(prev[k], val, k, key)
            }

            prev[k] = val
          }
        }
      }
      else if (prev && (key === "map" || key === "preload")) {
        if (!isArray(curr)) {
          curr = [curr]
        }
        configData[key] = prev.concat(curr)
      }
      else {
        configData[key] = curr
      }
    }
  }

  // Make sure that `configData.base` is an absolute path
  if (obj && obj.base) {
    makeBaseAbsolute()
  }

  return seajs
}

seajs.config.data = configData


function checkConfigConflict(prev, curr, k, key) {
  if (prev !== curr) {
    log("The config of " + key + '["' + k + '"] is changed from "' +
        prev + '" to "' + curr + '"', "warn")
  }
}

function makeBaseAbsolute() {
  var base = configData.base
  if (!isAbsolute(base)) {
    configData.base = id2Uri((isRoot(base) ? "" : "./") + base
        + (base.charAt(base.length - 1) === "/" ? "" : "/"))
  }
}


