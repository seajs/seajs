/**
 * config.js - The configuration for the loader
 */

// The root path to use for id2uri parsing
configData.base = (function() {
  var ret = loaderDir

  // If loaderUri is `http://test.com/libs/seajs/[seajs/1.2.3/]sea.js`, the
  // baseUri should be `http://test.com/libs/`
  var m = ret.match(/^(.+?\/)(?:seajs\/)+(?:\d[^/]+\/)?$/)
  if (m) {
    ret = m[1]
  }

  return ret
})()

// The loader directory
configData.dir = loaderDir

// The current working directory
configData.cwd = cwd

// The charset for requesting files
configData.charset = "utf-8"

// Modules that are needed to load before all other modules
configData.preload = []

// configData.debug - Debug mode. The default value is false
// configData.alias - An object containing shorthands of module id
// configData.paths - An object containing path shorthands in module id
// configData.vars - The {xxx} variables in module id
// configData.map - An array containing rules to map module uri
// configData.plugins - An array containing needed plugins


function config(data) {
  for (var key in data) {
    var curr = data[key]

    // Convert plugins to preload config
    if (curr && key === "plugins") {
      key = "preload"
      curr = plugin2preload(curr)
    }

    var prev = configData[key]

    // Merge object config such as alias, vars
    if (prev && isObject(prev)) {
      for (var k in curr) {
        prev[k] = curr[k]
      }
    }
    else {
      // Concat array config such as map, preload
      if (isArray(prev)) {
        curr = prev.concat(curr)
      }
      // Make sure that `configData.base` is an absolute directory
      else if (key === "base") {
        curr = normalize(addBase(curr + "/"))
      }

      // Set config
      configData[key] = curr
    }
  }

  emit("config", data)
  return seajs
}

config.data = configData
seajs.config = config

function plugin2preload(arr) {
  var ret = [], name

  while ((name = arr.shift())) {
    ret.push(configData.dir + "plugin-" + name)
  }
  return ret
}

