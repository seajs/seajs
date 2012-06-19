/**
 * The bootstrap and entrances
 */
;(function(host, config, fn) {

  var globalModule = host.globalModule


  /**
   * Loads modules to the environment and executes in callback.
   */
  fn.use = function(ids, callback) {
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


  // Loads the data-main module automatically.
  config.main && fn.use(config.main)


  // Parses the pre-call of seajs.config/seajs.use/define.
  // Ref: test/bootstrap/async-3.html
  (function(args) {
    if (args) {
      var hash = {
        0: 'config',
        1: 'use',
        2: 'define'
      }
      for (var i = 0; i < args.length; i += 2) {
        fn[hash[args[i]]].apply(host, args[i + 1])
      }
      delete host._seajs
    }
  })((host._seajs || 0)['args'])

})(seajs, seajs._config, seajs._fn)
