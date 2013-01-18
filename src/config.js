/**
 * The configuration
 */

// The configuration data for the loader
var config = {

  // Modules that are needed to load before all other modules
  preload: []
}

// Async inserted script
var loaderScript = document.getElementById('seajsnode')

// Static script
if (!loaderScript) {
  var scripts = document.getElementsByTagName('script')
  loaderScript = scripts[scripts.length - 1]
}

var loaderSrc = (loaderScript && getScriptAbsoluteSrc(loaderScript)) ||
    pageUri // When sea.js is inline, set base to pageUri.

var base = dirname(loaderSrc)
var loaderDir = base

// When src is "http://test.com/libs/seajs/1.0.0/sea.js", redirect base
// to "http://test.com/libs/"
var match = base.match(/^(.+\/)seajs\/[\.\d]+(?:-dev)?\/$/)
if (match) base = match[1]

config.base = base
config.main = loaderScript && loaderScript.getAttribute('data-main')
config.charset = 'utf-8'


/**
 * The function to configure the framework
 * config({
   *   'base': 'path/to/base',
   *   'vars': {
   *     'locale': 'zh-cn'
   *   },
   *   'alias': {
   *     'app': 'biz/xx',
   *     'jquery': 'jquery-1.5.2',
   *     'cart': 'cart?t=20110419'
   *   },
   *   'map': [
   *     ['test.cdn.cn', 'localhost']
   *   ],
   *   preload: [],
   *   charset: 'utf-8',
   *   debug: false
   * })
 *
 */
seajs.config = function(o) {
  for (var k in o) {
    if (!o.hasOwnProperty(k)) continue

    var previous = config[k]
    var current = o[k]

    if (previous && (k === 'alias' || k === 'vars')) {
      for (var p in current) {
        if (current.hasOwnProperty(p)) {
          var prevValue = previous[p]
          var currValue = current[p]

          checkAliasConflict(prevValue, currValue, p)
          previous[p] = currValue
        }
      }
    }
    else if (previous && (k === 'map' || k === 'preload')) {
      // for config({ preload: 'some-module' })
      if (isString(current)) {
        current = [current]
      }

      forEach(current, function(item) {
        if (item) {
          previous.push(item)
        }
      })
    }
    else {
      config[k] = current
    }
  }

  // Makes sure config.base is an absolute path.
  var base = config.base
  if (base && !isAbsolute(base)) {
    config.base = id2Uri((isRoot(base) ? '' : './') + base + '/')
  }

  debugSync()

  return this
}


function debugSync() {
  // For convenient reference
  seajs.debug = !!config.debug
}

debugSync()

function checkAliasConflict(previous, current, key) {
  if (previous && previous !== current) {
    log('The alias config is conflicted:',
        'key =', '"' + key + '"',
        'previous =', '"' + previous + '"',
        'current =', '"' + current + '"',
        'warn')
  }
}

