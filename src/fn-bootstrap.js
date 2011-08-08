
/**
 * @fileoverview The bootstrap and entrances.
 */

(function(host, data, fn) {

  var config = data.config;


  /**
   * Loads modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   */
  fn.use = function(ids, callback) {
    var preloadMods = config.preload;
    var len = preloadMods.length;

    if (len) {
      fn.load(preloadMods, function() {
        config.preload = preloadMods.slice(len);
        fn.use(ids, callback);
      });
    }
    else {
      fn.load(ids, callback);
    }
  };


  // main
  var mainModuleId = config.main;
  if (mainModuleId) {
    fn.use([mainModuleId]);
  }


  // Parses the pre-call of seajs.config/seajs.use/define.
  // Ref: test/bootstrap/async-3.html
  (function(args) {
    if (args) {
      var hash = {
        0: 'config',
        1: 'use',
        2: 'define'
      };
      for (var i = 0; i < args.length; i += 2) {
        fn[hash[args[i]]].apply(host, args[i + 1]);
      }
      delete host._seajs;
    }
  })((host._seajs || 0)['args']);

})(seajs, seajs._data, seajs._fn);
