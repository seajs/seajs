/**
 * The tiny console support
 */
;(function(util) {

  util.log = function() {
    if (typeof console !== 'undefined') {
      console.log(Array.prototype.join.call(arguments, ' '))
    }
  }

})(seajs._util)
