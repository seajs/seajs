
/**
 * @fileoverview A CommonJS module loader, focused on web.
 * @author lifesinger@gmail.com (Frank Wang)
 */


/**
 * Base namespace for the framework.
 */
this.seajs = { _seajs: this.seajs };


/**
 * @type {string} The version of the framework. It will be replaced
 * with "major.minor.patch" when building.
 */
seajs.version = '%VERSION%';


// Module status：
//  1. downloaded - The script file has been downloaded to the browser.
//  2. define()d - The define() has been executed.
//  3. memoize()d - The module info has been added to memoizedMods.
//  4. require()d -  The module.exports is available.


/**
 * The private data. Internal use only.
 */
seajs._data = {

  /**
   * The configuration data.
   */
  config: {},

  /**
   * Modules that have been memoize()d.
   * { uri: { dependencies: [], factory: fn, exports: {} }, ... }
   */
  memoizedMods: {},

  /**
   * Store the module information for "real" work in the onload event.
   */
  pendingMods: []
};


/**
 * The private utils. Internal use only.
 */
seajs._util = {};


/**
 * The inner namespace for methods. Internal use only.
 */
seajs._fn = {};
