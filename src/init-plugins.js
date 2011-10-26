
/**
 * @fileoverview Prepare for plugins environment.
 */

(function(data, util, fn, global) {

  var config = data.config;


  // register plugin names
  var alias = {};
  var loaderDir = util.loaderDir;

  util.forEach(['base', 'map', 'text', 'coffee', 'less'], function(name) {
    name = 'plugin-' + name;
    alias[name] = loaderDir + name;
  });

  fn.config({
    alias: alias
  });


  // handle seajs-debug
  if (~global.location.search.indexOf('seajs-debug') ||
      ~document.cookie.indexOf('seajs=1')) {
    config.debug = true;
    config.preload.push('plugin-map');
  }


})(seajs._data, seajs._util, seajs._fn, this);
