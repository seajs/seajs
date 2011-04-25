
/**
 * @fileoverview The error handler.
 */

(function(util, data) {

  var config = data.config;


  /**
   * The function to handle inner errors.
   *
   * @param {Object} o The error object.
   */
  util.error = function(o) {

    // Throw errors.
    if (o.type === 'error') {
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

})(seajs._util, seajs._data);
