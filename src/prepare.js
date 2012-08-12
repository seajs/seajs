/**
 * Prepare for bootstrapping
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

  // Uses `seajs-xxx` flag to load plugin-xxx.
  var RE = /seajs-([\w-]+)/
  var search = global.location.search

  var m = search.match(RE) || document.cookie.match(RE)
  if (m) {
    var pluginName = m[1]
    seajs.config({ debug: 2 }).use('seajs/plugin-' + pluginName)

    // Delays `seajs.use` calls to the onload of `mapfile` in debug mode.
    if (pluginName === 'debug') {
      seajs._use = seajs.use
      seajs._useArgs = []
      seajs.use = function() { seajs._useArgs.push(arguments); return seajs }
    }
  }

})(seajs, seajs._util, this)
