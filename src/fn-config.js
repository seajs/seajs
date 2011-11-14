
/**
 * @fileoverview The configuration.
 */

(function(host, util, data, fn) {

  var config = data.config;

  var noCachePrefix = 'seajs-ts=';
  var noCacheTimeStamp = noCachePrefix + util.now();


  // Async inserted script.
  var loaderScript = document.getElementById('seajsnode');

  // Static script.
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script');
    loaderScript = scripts[scripts.length - 1];
  }

  var loaderSrc = util.getScriptAbsoluteSrc(loaderScript);
  if (loaderSrc) {
    var base = util.dirname(loaderSrc);
    util.loaderDir = base;

    // When src is "http://test.com/libs/seajs/1.0.0/sea.js"
    // or "http://test.com/libs/seajs/sea.js",
    // redirect base to "http://test.com/libs/"
    var match = base.match(/^(.+\/)seajs\//);
    if (match) {
      base = match[1];
    }
    config.base = base;
  }
  // When script is inline code, src is empty.


  var mainAttr = loaderScript.getAttribute('data-main');
  if (mainAttr) {
    // data-main="abc" is equivalent to data-main="./abc"
    if (util.isTopLevel(mainAttr)) {
      mainAttr = './' + mainAttr;
    }
    config.main = mainAttr;
  }


  // The max time to load a script file.
  config.timeout = 20000;


  /**
   * The function to configure the framework.
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
   *   timeout: 20000, // 20s
   *   debug: false,
   *   main: './init'
   * });
   *
   * @param {Object} o The config object.
   */
  fn.config = function(o) {
    for (var k in o) {
      var previous = config[k];
      var current = o[k];

      if (previous && k === 'alias') {
        for (var p in current) {
          if (current.hasOwnProperty(p)) {
            checkConflict(previous[p], current[p]);
            previous[p] = current[p];
          }
        }
      }
      else if (previous && (k === 'map' || k === 'preload')) {
        // for config({ preload: 'some-module' })
        if (!util.isArray(current)) {
          current = [current];
        }
        util.forEach(current, function(item) {
          if (item) { // Ignore empty string.
            previous.push(item);
          }
        });
        // NOTICE: no need to check conflict for map and preload.
      }
      else {
        config[k] = current;
      }
    }

    // Make sure config.base is absolute path.
    var base = config.base;
    if (base && !util.isAbsolute(base)) {
      config.base = util.id2Uri('./' + base + '#');
    }

    // Use map to implement nocache
    if (config.debug === 2) {
      config.debug = 1;
      fn.config({
        map: [
          [/.*/, function(url) {
            if (url.indexOf(noCachePrefix) === -1) {
              url += (url.indexOf('?') === -1 ? '?' : '&') + noCacheTimeStamp;
            }
            return url;
          }]
        ]
      });
    }

    // Sync
    if (config.debug) {
      host.debug = config.debug;
    }

    return this;
  };


  function checkConflict(previous, current) {
    if (previous && previous !== current) {
      util.error('Config is conflicted:', previous, current);
    }
  }

})(seajs, seajs._util, seajs._data, seajs._fn);
