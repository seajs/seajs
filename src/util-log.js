
/**
 * @fileoverview The tiny console support.
 */

(function(util, data) {


  util.log = function() {
    if (data.config.debug && typeof console !== 'undefined') {
      console.log(join(arguments));
    }
  };


  // Helpers
  // -------

  function join(args) {
    return Array.prototype.join.call(args, ' ');
  }

})(seajs._util, seajs._data);
