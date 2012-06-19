/**
 * The tiny console support
 */
;(function(util, config) {

  util.log = function() {
    if (config.debug && typeof console !== 'undefined') {
      console.log(Array.prototype.join.call(arguments, ' '))
    }
  }

})(seajs._util, seajs._config)
