/**
 * The tiny console support
 */
;(function(util, config) {

  var AP = Array.prototype


  /**
   * The safe wrapper of console.log/error/...
   */
  util.log = function() {
    if (typeof console !== 'undefined') {
      var args = AP.slice.call(arguments)

      var type = 'log'
      var last = args[args.length - 1]
      console[last] && (type = args.pop())

      // Only show log info in debug mode
      if (type === 'log' && !config.debug) return

      var out = type === 'dir' ? args[0] : AP.join.call(args, ' ')
      console[type](out)
    }
  }

})(seajs._util, seajs._config)

