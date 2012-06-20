/**
 * Prepare for plugins environment
 */
;(function(seajs, util, global) {

  // Registers plugin names.
  var alias = {}
  var loaderDir = util.loaderDir

  util.forEach(
      ['base', 'map', 'text', 'json', 'coffee', 'less'],
      function(name) {
        name = 'plugin-' + name
        alias[name] = loaderDir + name
      })

  seajs.config({
    alias: alias
  })


  // Handles `seajs-debug` switch.
  if (global.location.search.indexOf('seajs-debug') > -1 ||
      document.cookie.indexOf('seajs=1') > -1) {
    seajs.config({ debug: 2, preload: ['plugin-map'] })
  }


})(seajs, seajs._util, this)
