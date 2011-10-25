
/**
 * @fileoverview Prepare for plugins environment.
 */

(function(util, data, fn, global) {

  var config = data.config;
  var loaderDir = util.loaderDir;


  // register plugin names
  seajs.config({
    alias: {
      'plugin-map': loaderDir + 'plugin-map',
      'plugin-coffee': loaderDir + 'plugin-coffee'
    }
  });


  // handle seajs-debug
  if (~global.location.search.indexOf('seajs-debug') ||
      ~document.cookie.indexOf('seajs=1')) {
    config.debug = true;
    config.preload.push(loaderDir + 'plugin-map');
  }


})(seajs._util, seajs._data, seajs._fn, this);
