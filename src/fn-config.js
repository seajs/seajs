
/**
 * @fileoverview The configuration.
 */

(function(util, data, fn) {

  var config = data.config;


  /**
   * Debug mode. It will be turned off automatically when compressing.
   * @const
   */
  config.debug = '%DEBUG%';


  // Async inserted script.
  var loaderScript = document.getElementById('seajsnode');

  // Static script.
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script');
    loaderScript = scripts[scripts.length - 1];
  }

  // When script is inline code, src is pageUrl.
  var src = util.getScriptAbsoluteSrc(loaderScript) || util.pageUrl;
  config.base = util.dirname(src);

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
    return this;
  };


  /**
   * The shortcut to set alias.
   *
   * @param {string} name The alias.
   * @param {string} value The actual value.
   */
  fn.alias = function(name, value) {
    var o = {};
    o[name] = value;
    return fn.config({
      alias: o
    });
  };


  function mix(r, s) {
    for (var k in s) {
      r[k] = s[k];
    }
  }

})(seajs._util, seajs._data, seajs._fn);
