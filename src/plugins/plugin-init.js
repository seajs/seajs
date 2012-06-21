/**
 * Prepare for plugins environment
 */
;(function(seajs, util, global) {

  // Sets a alias to `sea.js` directory for loading plugins.
  seajs.config({
    alias: { seajs: util.loaderDir }
  })


  // Uses `seajs-debug` flag to turn on debug mode.
  if (global.location.search.indexOf('seajs-debug') > -1 ||
      document.cookie.indexOf('seajs=1') > -1) {
    seajs.config({ debug: 2, preload: ['seajs/plugin-map'] })
  }

})(seajs, seajs._util, this)
