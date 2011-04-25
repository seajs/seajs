
/**
 * @fileoverview The configuration.
 */


/**
 * Debug mode. It will be turned off automatically when compressing.
 */
seajs._data.config.debug = '%DEBUG%';


(function(util, data, fn) {

  var config = data.config;

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
   *   debug: false,
   *   main: './init'
   * });
   *
   * @param {Object} o The config object.
   */
  fn['config'] = function(o) {
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

  function mix(r, s) {
    for (var k in s) {
      r[k] = s[k];
    }
  }

})(seajs._util, seajs._data, seajs._fn);
