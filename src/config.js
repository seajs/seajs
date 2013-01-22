/**
 * config.js - The configuration for the loader
 */

var config = {
  // the root path to use for id2uri parsing
  base: (function() {
    var ret = dirname(loaderUri)

    // If loaderUri is `http://test.com/libs/seajs/1.0.0/sea.js`, the baseUri
    // should be `http://test.com/libs/`
    var m = ret.match(/^(.+\/)seajs\/[\.\d]+(?:-dev)?\/$/)
    if (m) {
      ret = m[1]
    }

    return ret
  })(),

  // The charset for requesting files
  charset: 'utf-8',

  // Debug mode that will be turned off when building
  debug: true

  // alias - The shorthand alias for module id
  // vars - The {xxx} variables in module id
  // map - An array containing rules to map module uri
  // preload - Modules that are needed to load before all other modules
}

seajs.config = function(obj) {
  for (var configKey in obj) {
    if (hasOwn(obj, configKey)) {

      var oldConfig = config[configKey]
      var newConfig = obj[configKey]

      if (oldConfig === undefined) {
        config[configKey] = newConfig
        continue
      }

      // Append properties to object config
      if (configKey === 'alias' || configKey === 'vars') {
        for (var key in newConfig) {
          if (hasOwn(newConfig, key)) {
            var prev = oldConfig[key]
            var curr = newConfig[key]

            checkConfigConflict(prev, curr, key, configKey)
            oldConfig[key] = curr
          }
        }
      }
      // Append items to array config
      else if (configKey === 'map' || configKey === 'preload') {
        if (!isArray(newConfig)) {
          newConfig = [newConfig]
        }

        forEach(newConfig, function(item) {
          oldConfig.push(item)
        })
      }

    }
  }

  // Make sure that `config.base` is an absolute path
  if (obj.base) {
    makeBaseAbsolute()
  }

  return seajs
}

function checkConfigConflict(prev, curr, key, configKey) {
  if (prev && prev !== curr) {
    log('The ' + configKey + ' config is conflicted:',
        'key =', '"' + key + '"',
        'previous =', '"' + prev + '"',
        'current =', '"' + curr + '"',
        'warn')
  }
}

function makeBaseAbsolute() {
  var base = config.base
  if (!isAbsolute(base)) {
    config.base = id2Uri((isRoot(base) ? '' : './') + base + '/')
  }
}


