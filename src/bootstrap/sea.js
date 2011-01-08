
/**
 * @fileoverview Bootstrap for SeaJS.
 * @author lifesinger@gmail.com (Frank Wang)
 */


/**
 * Base namespace for the framework. Checks to see S is already defined in the
 * current scope before assigning to prevent depriving existed members in S.
 *
 * @const
 */
var S = S || {};


//==============================================================================
// Basic Information
//==============================================================================


/**
 * The version of the framework. It will be replaced with major.minor.patch
 * when building.
 *
 * @const
 */
S.version = '@VERSION@';


/**
 * Reference to the global context. In most cases this will be 'window'.
 */
S.global = this;


//==============================================================================
// Debug Helpers
//==============================================================================


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define S.DEBUG=false to the JSCompiler.
 */
S.DEBUG = true;


/**
 * Prints debug info. NOTICE: 'S.log(...)' lines will be automatically stripped
 * from *-min.js files when building.
 * @param {string} msg The message to log.
 * @param {string} cat The log category for the message such as "info", "warn",
 * "error", "time" etc. Default is "log".
 */
S.log = function(msg, cat) {
  if (S.DEBUG) {
    var console = S.global['console'];
    if (console && console['log']) {
      console[cat && console[cat] ? cat : 'log'](msg);
    }
  }
};


/**
 * Throws error message.
 * @param {string} msg The exception message.
 */
S.error = function(msg) {
  if (S.DEBUG) {
    throw msg;
  }
};


//==============================================================================
// Language Enhancements
//==============================================================================

