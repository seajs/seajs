/**
 * Prepare for debug mode
 */
;(function(seajs, util, global) {

  // The safe and convenient version of console.log
  seajs.log = util.log


  // Creates a stylesheet from a text blob of rules.
  seajs.importStyle = util.importStyle


  // Sets a alias to `sea.js` directory for loading plugins.
  seajs.config({
    alias: { seajs: util.loaderDir }
  })

  // Uses `seajs-debug` flag to turn on debug mode.
  if (global.location.search.indexOf('seajs-debug') > -1 ||
      document.cookie.indexOf('seajs=1') > -1) {
    seajs.config({ debug: 2 }).use('seajs/plugin-debug')

    // Delays `seajs.use` calls to the onload of `mapfile`.
    seajs._use = seajs.use
    seajs._useArgs = []
    seajs.use = function() { seajs._useArgs.push(arguments); return seajs }
  }

})(seajs, seajs._util, this)

