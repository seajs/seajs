
/**
 * @fileoverview The public api of seajs.
 */

(function(host, data, fn, global) {

  // Avoids conflicting when sea.js is loaded multi times.
  if (host._seajs) {
    global.seajs = host._seajs;
    return;
  }

  // SeaJS Loader API:
  host.use = fn.use;
  host.config = fn.config;

  // Module Authoring API:
  global.define = fn.define;

  // Keeps clean!
  if (!data.config.debug) {
    delete host._util;
    delete host._data;
    delete host._fn;
  }

})(seajs, seajs._data, seajs._fn, this);
