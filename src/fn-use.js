
/**
 * @fileoverview The bootstrap and entrances.
 */

(function(host, data, fn) {

  var config = data.config;

  fn.use = fn.load;

  var mainModuleId = config.main;
  if (mainModuleId) {
    fn.use([mainModuleId]);
  }

  // Parses the pre-call of seajs.config/seajs.boot/define.
  // Ref: test/bootstrap/async-3.html
  (function(args) {
    if (args) {
      var hash = {
        0: 'config',
        1: 'alias',
        2: 'use',
        3: 'define'
      };
      for (var i = 0; i < args.length; i += 2) {
        fn[hash[args[i]]].apply(host, args[i + 1]);
      }
      delete host._seajs;
    }
  })((host._seajs || 0)['args']);

})(seajs, seajs._data, seajs._fn);
