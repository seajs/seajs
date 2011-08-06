
/**
 * @fileoverview The configuration.
 */

(function(util, data, fn, global) {

  var config = data.config;


  // Async inserted script.
  var loaderScript = document.getElementById('seajsnode');

  // Static script.
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script');
    loaderScript = scripts[scripts.length - 1];
  }

  var loaderSrc = util.getScriptAbsoluteSrc(loaderScript), loaderDir;
  if (loaderSrc) {
    var base = loaderDir = util.dirname(loaderSrc);
    // When src is "http://test.com/libs/seajs/1.0.0/sea.js", redirect base
    // to "http://test.com/libs/"
    var match = base.match(/^(.+\/)seajs\/[\d\.]+\/$/);
    if (match) {
      base = match[1];
    }
    config.base = base;
  }
  // When script is inline code, src is empty.


  config.main = loaderScript.getAttribute('data-main') || '';


  // The max time to load a script file.
  config.timeout = 20000;


  // seajs-debug
  if (loaderDir &&
      (global.location.search.indexOf('seajs-debug') !== -1 ||
          document.cookie.indexOf('seajs=1') !== -1)) {
    config.debug = true;
    config.preload.push(loaderDir + 'plugin-map');
  }


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
      if (o.hasOwnProperty(k)) {
        config[k] = o[k];
      }
    }

    // Make sure config.base is absolute path.
    var base = config.base;
    if (base.indexOf('://') === -1) {
      config.base = util.id2Uri(base + '#');
    }

    return this;
  };

})(seajs._util, seajs._data, seajs._fn, this);
