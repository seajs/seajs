/**
 * Prepare for bootstrapping
 */
;(function(seajs, util, global) {

  // The safe and convenient version of console.log
  seajs.log = util.log


  // Sets a alias to `sea.js` directory for loading plugins.
  seajs.config({
    vars: { seajs: util.loaderDir }
  })


  // Uses `seajs-xxx` flag to load plugin-xxx.
  util.forEach(getStartupPlugins(), function(name) {
    seajs.use('{seajs}/plugin-' + name)

    // Delays `seajs.use` calls to the onload of `mapfile` in debug mode.
    if (name === 'debug') {
      seajs._use = seajs.use
      seajs._useArgs = []
      seajs.use = function() { seajs._useArgs.push(arguments); return seajs }
    }
  })


  // Helpers
  // -------

  function getStartupPlugins() {
    var ret = []
    var str = global.location.search

    // Converts `seajs-xxx` to `seajs-xxx=1`
    str = str.replace(/(seajs-\w+)(&|$)/g, '$1=1$2')

    // Add cookie string
    str += ' ' + document.cookie

    // Excludes seajs-xxx=0
    str.replace(/seajs-(\w+)=[1-9]/g, function(m, name) {
      ret.push(name)
    })

    return util.unique(ret)
  }

})(seajs, seajs._util, this)

