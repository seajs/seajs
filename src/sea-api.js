
/**
 * @fileoverview The public api of seajs.
 */

(function(host, data, fn, global) {

  // seajs loader api:
  host.use = fn.use;
  host.config = fn.config;

  // Module authoring api:
  global.define = fn.define;

  // In module environment:
  //  require
  //  exports
  //  module, module.load(), module.uri etc.

  // Keep clean!
  if (!data.config.debug) {
    delete host._util;
    delete host._data;
    delete host._fn;
  }

})(seajs, seajs._data, seajs._fn, this);
