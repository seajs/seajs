/**
 * config.js - The configuration for the loader
 */

// The root path to use for id2uri parsing
data.base = (function() {
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
data.dir = loaderDir

// The current working directory
data.cwd = cwd

// The charset for requesting files
data.charset = "utf-8"

// Modules that are needed to load before all other modules
data.preload = (function() {
  var plugins = []

  // Convert `seajs-xxx` to `seajs-xxx=1`
  // NOTE: use `seajs-xxx=1` flag in url or cookie to enable `plugin-xxx`
  var str = loc.search.replace(/(seajs-\w+)(&|$)/g, "$1=1$2")

  // Add cookie string
  str += " " + doc.cookie

  // Exclude seajs-xxx=0
  str.replace(/seajs-(\w+)=1/g, function(m, name) {
    plugins.push(name)
  })

  return plugin2preload(plugins)
})()

// data.debug - Debug mode. The default value is false
// data.alias - An object containing shorthands of module id
// data.paths - An object containing path shorthands in module id
// data.vars - The {xxx} variables in module id
// data.map - An array containing rules to map module uri
// data.plugins - An array containing needed plugins


function config(configData) {
  // Clear id2Uri cache to avoid getting old uri when config is updated
  id2UriCache = {}

  for (var key in configData) {
    var curr = configData[key]

    // Convert plugins to preload config
    if (curr && key === "plugins") {
      key = "preload"
      curr = plugin2preload(curr)
    }

    var prev = data[key]

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
      // Make sure that `data.base` is an absolute directory
      else if (key === "base") {
        curr = normalize(addBase(curr + "/"))
      }

      // Set config
      data[key] = curr
    }
  }

  emit("config", configData)
  return seajs
}

seajs.config = config

function plugin2preload(arr) {
  var ret = [], name

  while ((name = arr.shift())) {
    ret.push(data.dir + "plugin-" + name)
  }
  return ret
}

