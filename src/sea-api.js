/**
 * The public api
 */
;(function(seajs, global) {

  // Avoids conflicting when sea.js is loaded multi times.
  if (seajs._seajs) {
    global.seajs = seajs._seajs
    return
  }


  // For plugin developers
  seajs.pluginSDK = {
    Module: seajs.Module,
    util: seajs._util,
    config: seajs._config
  }


  // Keeps clean!
  delete seajs.Module
  delete seajs.define
  delete seajs._util
  delete seajs._config
  delete seajs._seajs
  delete seajs.globalModule

})(seajs, this)
