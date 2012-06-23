/**
 * Prepare for debug mode
 */
;(function(seajs, util, global) {

  var cachedModules = seajs.cache


  /**
   * Finds the specific modules via string or regexp quickly.
   */
  seajs.find = function(selector) {
    var matches = []

    util.forEach(util.keys(cachedModules), function(uri) {
      if (util.isString(selector) && uri.indexOf(selector) > -1 ||
          util.isRegExp(selector) && selector.test(uri)) {
        var module = cachedModules[uri]
        module.exports && matches.push(module.exports)
      }
    })

    if (matches.length === 1) {
      matches = matches[0]
    }

    return matches
  }


  // The safe and convenient version of console.log
  seajs.log = util.log


  // Sets a alias to `sea.js` directory for loading plugins.
  seajs.config({
    alias: { seajs: util.loaderDir }
  })

  // Uses `seajs-debug` flag to turn on debug mode.
  if (global.location.search.indexOf('seajs-debug') > -1 ||
      document.cookie.indexOf('seajs=1') > -1) {
    seajs.config({ debug: 2 }).use('seajs/plugin-map')

    // Delays `seajs.use` calls to the onload of `mapfile`.
    seajs._use = seajs.use
    seajs._useArgs = []
    seajs.use = function() { seajs._useArgs.push(arguments); return seajs }
  }

})(seajs, seajs._util, this)

