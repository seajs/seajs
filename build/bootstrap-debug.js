/*
Copyright 2011, SeaJS v0.1.0
MIT Licensed
build time: Jan 12 19:49
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

/**
 * @fileoverview A module loader focused on web.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function() {

  //============================================================================
  // Global Variables & Related Helpers
  //============================================================================

  // module status\uff1a
  // 1. downloaded - The module file has been downloaded to the browser.
  // 2. declared - The module declare function has been executed.
  // 3. provided - The module info has been added to providedMods.
  // 4. required -  mod.exports is available.

  // modules that are beening downloaded.
  var loadingMods = {};

  // the module that is declared, but has not been provided.
  var pendingMod = null;

  // modules that have beed provided.
  // { uri: { id: string, dependencies: [], factory: function }, ... }
  var providedMods = {};

  // init mainModDir and mainModId.
  var doc = document;
  var scripts = doc.getElementsByTagName('script');
  var loaderScript = scripts[scripts.length - 1];
  var mainModDir = dirname(getScriptAbsSrc(loaderScript));
  var mainModId = loaderScript.getAttribute('data-main');

  function memoize(id, mod) {
    mod.id = id;
    providedMods[fullpath(id)] = mod;
  }

  function getProvidedMod(id) {
    return providedMods[fullpath(id)];
  }

  function isMemoized(id) {
    return !!getProvidedMod(id);
  }

  function getUnmemoizedIds(ids) {
    var ret = [], i = 0, len = ids.length, id;
    for (; i < len; i++) {
      id = ids[i];
      if (!isMemoized(id)) {
        ret.push(id);
      }
    }
    return ret;
  }

  //============================================================================
  // Requiring Members
  //============================================================================

  function Require() {

    function require(id) {
      var mod = getProvidedMod(id);
      if (!mod) {
        return S.error('Module ' + id + ' is not provided.');
      }

      // initialize mod.exports
      if (!mod.exports) {
        mod.exports = getExports(mod);
      }
      return mod.exports;
    }

    return require;
  }

  function getExports(mod) {
    var fn = mod.factory;
    var exports = {};

    if (S.isFunction(fn)) {
      exports = execFactory(mod, fn);
    }
    else if (S.type(fn) === 'object') {
      exports = fn;
    }

    return exports;
  }

  function execFactory(mod, factory) {
    var exports = {};
    var ret = factory.call(mod, new Require(), exports, mod);
    if (ret) exports = ret;
    return exports;
  }

  //============================================================================
  // Provisioning Members
  //============================================================================

  /**
   * provide modules to the environment, and then fire callback.
   */
  function provide(ids, callback, norequire) {
    ids = getUnmemoizedIds(ids);
    if (ids.length === 0) return cb();

    var remain = ids.length;
    for (var i = 0, len = remain; i < len; i++) {
      (function(id) {

        load(id, function() {
          var deps = (getProvidedMod(id) || 0).dependencies || [];
          deps = getUnmemoizedIds(deps);
          var len = deps.length;

          if (len) {
            remain += len;
            provide(deps, function() {
              remain -= len;
              if (remain === 0) cb();
            }, true);
          }

          //S.log('id = ' + id + ' remain = ' + (remain - 1));
          if (--remain === 0) cb();
        });

      })(ids[i]);
    }

    function cb() {
      callback && callback(norequire ? undefined : new Require());
    }
  }

  /**
   * declare a module to the environment.
   */
  function declare(id, deps, factory) {
    // overload arguments
    if (S.isArray(id)) {
      factory = deps;
      deps = id;
      id = '';
    }
    if (S.isFunction(id)) {
      factory = id;
      deps = [];
      id = '';
    }

    var mod = { dependencies: deps, factory: factory };
    if (id) {
      memoize(id, mod);
      // if a file contains multi declares, a declare without id is valid
      // only when it is the last one.
      pendingMod = null;
    } else {
      pendingMod = mod;
    }
  }

  function load(id, callback) {
    // reset to avoid polluting by declare without id in static script.
    pendingMod = null;
    var url = fullpath(id);

    if (loadingMods[url]) {
      scriptOnload(loadingMods[url], cb);
    } else {
      loadingMods[url] = getScript(fullpath(id), cb);
    }

    function cb() {
      if (pendingMod) {
        memoize(id, pendingMod);
        pendingMod = null;
      }
      if (callback) callback();
      if (loadingMods.url) delete loadingMods.url;
    }
  }

  var head = doc.getElementsByTagName('head')[0];

  function getScript(url, success) {
    var node = doc.createElement('script');

    scriptOnload(node, function() {
      if (success) success.call(node);

      try {
        for (var p in node) delete node[p];
      } catch (x) {
      }
      head.removeChild(node);
    });

    node.async = true;
    node.src = url;
    return head.insertBefore(node, head.firstChild);
  }

  function scriptOnload(node, callback) {
    node.addEventListener('load', callback, false);
  }

  if (!doc.createElement('script').addEventListener) {
    scriptOnload = function(node, callback) {
      var oldCallback = node.onreadystatechange;
      node.onreadystatechange = function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          node.onreadystatechange = null;
          if (oldCallback) oldCallback();
          callback.call(this);
        }
      };
    }
  }

  //============================================================================
  // MainModule Entrance
  //============================================================================

  // provide main module to environment.
  if (mainModId) {
    provide([mainModId]);
  }

  // reset loader enviroment.
  function reset(dir) {
    pendingMod = null;
    providedMods = {};
    if (dir) mainModDir = dir;
  }

  //============================================================================
  // Static Helpers
  //============================================================================

  /**
   * Extract the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b'
   * dirname('a/b/c') ==> 'a/b'
   * dirname('a/b/c/') ==> 'a/b/c'
   * dirname('d.js') ==> '.'
   */
  function dirname(path) {
    var s = path.split('/').slice(0, -1).join('/');
    return s ? s : '.';
  }

  /**
   * Canonicalize path.
   * realpath('a/b/c') ==> 'a/b/c'
   * realpath('a/b/../c') ==> 'a/c'
   * realpath('a/b/./c') ==> '/a/b/c'
   * realpath('a/b/c/') ==> 'a/b/c/'
   */
  function realpath(path) {
    var old = path.split('/');
    var ret = [], part, i, len;

    for (i = 0, len = old.length; i < len; i++) {
      part = old[i];
      if (part == '..') {
        if (ret.length === 0) {
          S.error('Invalid module path: ' + path);
        }
        ret.pop();
      } else if (part !== '.') {
        ret.push(part);
      }
    }

    return ret.join('/');
  }

  /**
   * Turn a module id to full path.
   * fullpath('') ==> ''
   * fullpath('/c/d') ==> 'http://path/to/main/c/d'
   * fullpath('./c/d') ==> 'http://path/to/main/c/d'
   * fullpath('../c/d') ==> 'http://path/to/c/d'
   * fullpath('c') ==> 'http://path/to/main/c'
   * fullpath('c/') ==> 'http://path/to/main/c/'
   * fullpath('http://path/') ==> 'http://path/'
   */
  function fullpath(id) {
    if (id === '' || id.indexOf('://') !== -1) return id;
    if (id.charAt(0) === '/') id = id.substring(1);
    return realpath(mainModDir + '/' + id) + '.js';
  }

  function getScriptAbsSrc(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4);
  }

  //============================================================================
  // Public API
  //============================================================================

  S.declare = declare;
  S.provide = provide;
  S.reset = reset;

})();

/**
 * TODO:
 *  - S.using('something').as('sth')
 *  - auto generate dependencies when concating multi modules.
 */
