
/**
 * @fileoverview The error handler.
 */

(function(util, data) {


  util.error = function() {
      throw join(arguments);
  };


  util.warn = function() {
    if (data.config.debug && typeof console !== 'undefined') {
      console.warn(join(arguments));
    }
  };


  function join(args) {
    return Array.prototype.join.call(args, ' ');
  }

})(seajs._util, seajs._data);
