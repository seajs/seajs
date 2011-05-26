
/**
 * @fileoverview The configuration.
 */

(function(util, data, fn) {

  var config = data.config;


  // Async inserted script.
  var loaderScript = document.getElementById('seajsnode');

  // Static script.
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script');
    loaderScript = scripts[scripts.length - 1];
  }

  var src = util.getScriptAbsoluteSrc(loaderScript);
  if (src) {
    src = util.dirname(src);
    // When src is "http://test.com/libs/seajs/1.0.0/sea.js", redirect base
    // to "http://test.com/libs/"
    var match = src.match(/^(.+\/)seajs\/[\d\.]+\/$/);
    if (match) {
      src = match[1];
    }
    config.base = src;
  }
  // When script is inline code, src is empty.


  config.main = loaderScript.getAttribute('data-main') || '';


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
      var sub = config[k];
      if (typeof sub === 'object') {
        mix(sub, o[k]);
      } else {
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


  function mix(r, s) {
    for (var k in s) {
      r[k] = s[k];
    }
  }

})(seajs._util, seajs._data, seajs._fn);
