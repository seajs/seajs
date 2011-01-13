
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
S.isArray = Array.isArray ? Array['isArray'] : function(o) {
  return S.type(o) === 'array';
};


/**
 * Copies all the members of a source object to a target object.
 * @param {Object} target Target.
 * @param {Object} source Source.
 * @return {Object} Target.
 */
S.mix = function(target, source) {
  for (var x in source) {
    if (source.hasOwnProperty(x)) {
      target[x] = source[x];
    }
  }
  return target;
};


/**
 * If the browser doesn't supply us with indexOf (I'm looking at you, MSIE),
 * we need this function.
 * @param {Array} array The Array to seach in.
 * @param {*} item The item to search.
 * @return {number} Return the position of the first occurrence of an
 * item in an array, or -1 if the item is not included in the array.
 */
S.indexOf = Array.prototype.indexOf ?
    function(array, item) {
      return array.indexOf(item);
    } :
    function(array, item) {
      for (var i = 0, l = array.length; i < l; i++) {
        if (array[i] === item) {
          return i;
        }
      }
      return -1;
    };


/**
 * Search for a specified value index within an array.
 * @param {Array} array The Array to seach in.
 * @param {*} item The item to search.
 * @return {boolean} Whether the item is in the specific array.
 */
S.inArray = function(array, item) {
  return S.indexOf(array, item) > -1;
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
S.now = Date.now || (function() {
  return new Date().getTime();
});
