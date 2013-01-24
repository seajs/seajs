/**
 * config.js - The configuration for the loader
 */

var configData = {
  // The root path to use for id2uri parsing
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
  charset: 'utf-8'

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

      if (prev && (key === 'alias' || key === 'vars')) {
        for (var k in curr) {
          if (hasOwn(curr, k)) {

            var p = prev[k]
            var c = curr[k]

            checkConfigConflict(p, c, k, key)
            prev[k] = c
          }
        }
      }
      else if (prev && (key === 'map' || key === 'preload')) {
        if (!isArray(curr)) {
          curr = [curr]
        }

        forEach(curr, function(item) {
          prev.push(item)
        })
      }
      else {
        configData[key] = curr
      }
    }
  }

  // Make sure that `configData.base` is an absolute path
  if (obj.base) {
    makeBaseAbsolute()
  }

  return seajs
}

seajs.config.data = configData


function checkConfigConflict(prev, curr, k, key) {
  if (prev && prev !== curr) {
    log('The ' + key + ' config is conflicted:',
        'key =', '"' + k + '"',
        'previous =', '"' + prev + '"',
        'current =', '"' + curr + '"',
        'warn')
  }
}

function makeBaseAbsolute() {
  var base = configData.base
  if (!isAbsolute(base)) {
    configData.base = id2Uri((isRoot(base) ? '' : './') + base + '/')
  }
}


