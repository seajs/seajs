/*
Copyright 2011, SeaJS v0.1.0
MIT Licensed
build time: Jan 8 23:50
*/

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
S.version = '0.1.0';


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
 * Determine the internal JavaScript [[Class]] of an object.
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
 * @fileoverview SeaJS Module Loader.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function() {

  var noop = function() {
  };

  var loader = S.ModuleLoader = {
    baseUrl: '',
    importModule: noop,
    importingModule: null,
    main: null
  };

  /**
   * @constructor
   */
  loader.Module = function(id, uri) {
    this.id = id;
    this.uri = uri || getURI(id);

    this.require = noop;
    this.exports = {};
  };

  function getURI(id) {
    return loader.baseUrl + id + '.js';
  }

  S.declare = function(factory) {
    var module = loader.importingModule;
    module.factory = factory;
    factory.call(module, module.require, module.exports, module);
  };

})();

/**
 * @fileoverview The web part for SeaJS Module Loader.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function(loader) {

  function scriptOnload(node, callback) {
    node.addEventListener('load', callback, false);
  }
  if (!document.createElement('script').addEventListener) {
    scriptOnload = function(node, callback) {
      var oldCallback = node.onreadystatechange;
      node.onreadystatechange = function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          node.onreadystatechange = null;
          oldCallback && oldCallback();
          callback.call(this);
        }
      };
    }
  }

  function getScript(url, success) {
    var node = document.createElement('script');
    var head = document.getElementsByTagName('head')[0];

    node.src = url;
    node.async = true;

    scriptOnload(node, function() {
      if (success) success.call(node);
      head.removeChild(node);
    });

    head.insertBefore(node, head.firstChild);
  }

  var scripts = document.getElementsByTagName('script');
  var loaderScript = scripts[scripts.length - 1];
  var src = loaderScript.src;
  var main = loaderScript.getAttribute('data-main');

  // exports
  loader.baseUrl = src.substring(0, src.lastIndexOf('/') + 1);
  loader.importModule = getScript;
  if (main) loader.main = new loader.Module(main);

})(S.ModuleLoader);

/**
 * @fileoverview Init Module Loader.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function(loader) {

  var main = loader.main;

  if (main) {
    loader.importingModule = main;
    loader.importModule(main.uri);
  }

})(S.ModuleLoader);
