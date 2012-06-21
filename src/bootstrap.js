/**
 * The bootstrap and entrances
 */
;(function(seajs, config, global) {

  var _seajs = seajs._seajs

  // Avoids conflicting when sea.js is loaded multi times.
  if (_seajs && !_seajs.args) {
    global.seajs = seajs._seajs
    return
  }


  var globalModule = seajs.globalModule

  /**
   * Loads modules to the environment and executes in callback.
   * @param {function()=} callback
   */
  seajs.use = function(ids, callback) {
    var preloadMods = config.preload

    if (preloadMods.length) {
      // Loads preload modules before all other modules.
      globalModule._use(preloadMods, function() {
        config.preload = []
        globalModule._use(ids, callback)
      })
    }
    else {
      globalModule._use(ids, callback)
    }
  }


  // Tweaks public api
  global.define = seajs.define

  // For plugin developers
  seajs.pluginSDK = {
    Module: seajs.Module,
    util: seajs._util,
    config: seajs._config
  }


  // Loads the data-main module automatically.
  config.main && seajs.use(config.main)

  // Parses the pre-call of seajs.config/seajs.use/define.
  // Ref: test/bootstrap/async-3.html
  ;(function(args) {
    if (args) {
      var hash = {
        0: 'config',
        1: 'use',
        2: 'define'
      }
      for (var i = 0; i < args.length; i += 2) {
        seajs[hash[args[i]]].apply(seajs, args[i + 1])
      }
    }
  })((_seajs || 0)['args'])


  // Keeps clean!
  delete seajs.Module
  delete seajs.define
  delete seajs.globalModule
  delete seajs._util
  delete seajs._config
  delete seajs._seajs

})(seajs, seajs._config, this)
