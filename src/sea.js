/**
 * A Module Loader for the Web
 * @author lifesinger@gmail.com (Frank Wang)
 */


/**
 * Base namespace for the framework.
 */
var seajs = { _seajs: seajs }


/**
 * The version of the framework. It will be replaced with "major.minor.patch"
 * when building.
 */
seajs.version = '%VERSION%'


/**
 * The private utilities. Internal use only.
 */
seajs._util = {}


/**
 * The private configuration data. Internal use only.
 */
seajs._config = {

  /**
   * Debug mode. It will be turned off automatically when compressing.
   */
  debug: '%DEBUG%',

  /**
   * Modules that are needed to load before all other modules.
   */
  preload: []
}


/**
 * The inner namespace for methods. Internal use only.
 */
seajs._fn = {}
