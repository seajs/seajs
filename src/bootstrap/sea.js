
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


/**
 * Determines the internal JavaScript [[Class]] of an object.
 */
S.type = (function() {
  var cls = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date',
    'RegExp', 'Object'], cls2type = {};

  for (var i = 0; i < cls.length; i++) {
    var name = cls[i];
    cls2type['[object ' + name + ']'] = name.toLowerCase();
  }

  return function(o) {
    return o == null ?
        String(o) :
        cls2type[Object.prototype.toString.call(o)] || 'object';
  }
})();


/**
 * Checks to if an object is string.
 * @param {*} o Variable to test.
 * @return {boolean} Whether variable is a string.
 */
S.isString = function(o) {
  return S.type(o) === 'string';
};


/**
 * Checks to if an object is function.
 * @param {*} o Variable to test.
 * @return {boolean} Whether variable is a boolean.
 */
S.isFunction = function(o) {
  return S.type(o) === 'function';
};


/**
 * Checks to if an object is array.
 * @param {*} o Variable to test.
 * @return {boolean} Whether variable is an array.
 */
S.isArray = Array.isArray ? Array.isArray : function(o) {
  return S.type(o) === 'array';
};


/**
 * Copies all the members of a source object to a target object.
 * @param {object} target Target.
 * @param {object} source Source.
 * @return {object} Target.
 */
S.mix = function(target, source) {
  for (var x in source) {
    if (source.hasOwnProperty(x)) {
      target[x] = source[x];
    }
  }
  return target;
};
