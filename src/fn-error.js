
/**
 * @fileoverview The error handler.
 */

(function(data, fn) {

  var config = data.config;

  /**
   * Enum for error types.
   * @enum {number}
   */
  data.errorCodes = {
    LOAD: 40,
    REQUIRE: 41,
    CYCLIC: 42,
    EXPORTS: 43
  };


  /**
   * The function to handle inner errors.
   *
   * @param {Object} o The error object.
   */
  fn.error = function(o) {
    var code = o.code;

    // Call custom error handler.
    if (config.error && config.error[code]) {
      config.error[o](o);
    }
    // Throw errors.
    else if (o.type === 'error') {
      throw 'Error occurs! ' + dump(o);
    }
    // Output debug info.
    else if (config.debug && typeof console !== 'undefined') {
      console[o.type](dump(o));
    }
  };

  function dump(o) {
    var out = ['{'];

    for (var p in o) {
      if (typeof o[p] === 'number' || typeof o[p] === 'string') {
        out.push(p + ': ' + o[p]);
        out.push(', ');
      }
    }
    out.pop();
    out.push('}');

    return out.join('');
  }

})(seajs._data, seajs._fn);
