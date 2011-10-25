
/**
 * @fileoverview Prepare for plugins environment.
 */

(function(data, util, fn, global) {

  var config = data.config;
  var loaderDir = util.loaderDir;


  // register plugin names
  fn.config({
    alias: {
      'plugin-map': loaderDir + 'plugin-map',
      'plugin-coffee': loaderDir + 'plugin-coffee'
    }
  });


  // handle seajs-debug
  if (~global.location.search.indexOf('seajs-debug') ||
      ~document.cookie.indexOf('seajs=1')) {
    config.debug = true;
    config.preload.push('plugin-map');
  }


})(seajs._data, seajs._util, seajs._fn, this);
