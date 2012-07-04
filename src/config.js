/**
 * The configuration
 */
;(function(seajs, util, config) {

  var noCachePrefix = 'seajs-ts='
  var noCacheTimeStamp = noCachePrefix + util.now()


  // Async inserted script
  var loaderScript = document.getElementById('seajsnode')

  // Static script
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script')
    loaderScript = scripts[scripts.length - 1]
  }

  var loaderSrc = util.getScriptAbsoluteSrc(loaderScript) ||
      util.pageUri // When sea.js is inline, set base to pageUri.

  var base = util.dirname(getLoaderActualSrc(loaderSrc))
  util.loaderDir = base

  // When src is "http://test.com/libs/seajs/1.0.0/sea.js", redirect base
  // to "http://test.com/libs/"
  var match = base.match(/^(.+\/)seajs\/[\d\.]+\/$/)
  if (match) {
    base = match[1]
  }

  config.base = base


  var dataMain = loaderScript.getAttribute('data-main')
  if (dataMain) {
    config.main = dataMain
  }


  // The default charset of module file.
  config.charset = 'utf-8'


  /**
   * The function to configure the framework
   * config({
   *   'base': 'path/to/base',
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

      if (previous && k === 'alias') {
        for (var p in current) {
          if (current.hasOwnProperty(p)) {

            var prevValue = previous[p]
            var currValue = current[p]

            // Converts {jquery: '1.7.2'} to {jquery: 'jquery/1.7.2/jquery'}
            if (/^\d+\.\d+\.\d+$/.test(currValue)) {
              currValue = p + '/' + currValue + '/' + p
            }

            checkAliasConflict(prevValue, currValue, p)
            previous[p] = currValue

          }
        }
      }
      else if (previous && (k === 'map' || k === 'preload')) {
        // for config({ preload: 'some-module' })
        if (util.isString(current)) {
          current = [current]
        }

        util.forEach(current, function(item) {
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
    if (base && !util.isAbsolute(base)) {
      config.base = util.id2Uri('./' + base + '/')
    }

    // Uses map to implement nocache.
    if (config.debug === 2) {
      config.debug = 1
      seajs.config({
        map: [
          [/^.*$/, function(url) {
            if (url.indexOf(noCachePrefix) === -1) {
              url += (url.indexOf('?') === -1 ? '?' : '&') + noCacheTimeStamp
            }
            return url
          }]
        ]
      })
    }

    debugSync()

    return this
  }


  function debugSync() {
    if (config.debug) {
      // For convenient reference
      seajs.debug = !!config.debug
    }
  }

  debugSync()


  function getLoaderActualSrc(src) {
    if (src.indexOf('??') === -1) {
      return src
    }

    // Such as: http://cdn.com/??seajs/1.2.0/sea.js,jquery/1.7.2/jquery.js
    // Only support nginx combo style rule. If you use other combo rule, please
    // explicitly config the base path and the alias for plugins.
    var parts = src.split('??')
    var root = parts[0]
    var paths = util.filter(parts[1].split(','), function(str) {
      return str.indexOf('sea.js') !== -1
    })

    return root + paths[0]
  }

  function checkAliasConflict(previous, current, key) {
    if (previous && previous !== current) {
      util.log('The alias config is conflicted:',
          'key =', '"' + key + '"',
          'previous =', '"' + previous + '"',
          'current =', '"' + current + '"',
          'warn')
    }
  }

})(seajs, seajs._util, seajs._config)

