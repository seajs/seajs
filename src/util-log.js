/**
 * The tiny console
 */
;(function(util) {

  /**
   * The safe wrapper of console.log/error/...
   */
  util.log = function() {
    if (typeof console !== 'undefined') {
      var args = Array.prototype.slice.call(arguments)

      var type = 'log'
      var last = args[args.length - 1]
      console[last] && (type = args.pop())

      // Only show log info in debug mode
      if (type === 'log' && !seajs.debug) return

      // See issue#349
      console[type](args[0], args[1], args[2], args[3], args[4], args[5])
    }
  }

})(seajs._util)

