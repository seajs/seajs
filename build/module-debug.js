/*
Copyright 2011, SeaJS v0.3.0
MIT Licensed
build time: Jan 16 22:56
*/


/**
 * @fileoverview A CommonJS modules environment, focused on web.
 * @author lifesinger@gmail.com (Frank Wang)
 */


/**
 * Base namespace for the framework. Checks to see "module" is already defined
 * in the current scope before assigning to prevent depriving existed members.
 *
 * @const
 */
var module = module || {};


/**
 * The version of the framework. It will be replaced with major.minor.patch
 * when building.
 *
 * @const
 */
module.seajs = '0.3.0';


(function(global) {

  //----------------------------------------------------------------------------
  // The minimal language enhancement
  //----------------------------------------------------------------------------

  var toString = Object.prototype.toString;
  var hasOwnProperty = Object.prototype.hasOwnProperty;


  /**
   * Determines if the specified value is a string.
   * @param {*} val Variable to test.
   * @return {boolean} Whether variable is a string.
   */
  function isString(val) {
    return toString.call(val) === '[object String]';
  }


  /**
   * Determines if the specified value is a function.
   * @param {*} val Variable to test.
   * @return {boolean} Whether variable is a function.
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }


  /**
   * Determines if the specified value is a function.
   * @param {*} val Variable to test.
   * @return {boolean} Whether variable is an array.
   */
  var isArray = Array.isArray ? Array['isArray'] : function(val) {
    return toString.call(val) === '[object Array]';
  };


  /**
   * If the browser doesn't supply us with indexOf (I'm looking at you, MSIE),
   * we need this function.
   * @param {Array} array The Array to search in.
   * @param {*} item The item to search.
   * @return {number} Return the position of the first occurrence of an
   *     item in an array, or -1 if the item is not included in the array.
   */
  var indexOf = Array.prototype.indexOf ?
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
   * @return {number} An integer value representing the number of milliseconds
   *     between midnight, January 1, 1970 and the current time.
   */
  var now = Date.now || (function() {
    return new Date().getTime();
  });


  //----------------------------------------------------------------------------
  // Global variables and related helpers
  //----------------------------------------------------------------------------

  // Module status\uff1a
  // 1. downloaded - The module file has been downloaded to the browser.
  // 2. declared - The module declare function has been executed.
  // 3. provided - The module info has been added to providedMods.
  // 4. required -  mod.exports is available.

  // Modules that are being downloaded.
  // { uri: scriptNode, ... }
  var loadingMods = {};

  // The module that is declared, but has not been provided.
  var pendingMod = null;

  // For old IE
  // { id: string, timestamp: number }
  var pendingModOldIE = null;
  var cacheTakenTime = 10;
  var isIE876 = !+'\v1';

  // Modules that have been provided.
  // { uri: { id: string, dependencies: [], factory: function }, ... }
  var providedMods = {};

  function memoize(id, mod) {
    mod.id = id;
    mod.dependencies = canonicalize(mod.dependencies, id);
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

  // Gets the directory of main module.
  var scripts = document.getElementsByTagName('script');
  var loaderScript = scripts[scripts.length - 1];
  var mainModDir = dirname(getScriptAbsoluteSrc(loaderScript));

  /**
   * Resets the environment.
   * @param {string=} dir The directory of main module.
   */
  function reset(dir) {
    loadingMods = {};
    providedMods = {};
    pendingMod = null;
    pendingModOldIE = null;
    if (dir) mainModDir = dir;
  }


  //----------------------------------------------------------------------------
  // Members for "require"
  //----------------------------------------------------------------------------

  /**
   * The factory of "require" function.
   * @constructor
   */
  function Require(sandbox) {
    // { id: string, deps: [], parent: sandbox }
    sandbox = sandbox || { deps: [] };

    function require(id) {
      id = canonicalize(id, sandbox.id);
      var mod;

      // Restrains to sandbox environment.
      if (indexOf(sandbox.deps, id) === -1 || !(mod = getProvidedMod(id))) {
        throw 'Invalid module id: ' + id;
      }

      // Checks cyclic dependencies.
      if (isCyclic(sandbox, id)) {
        printCyclicStack(sandbox, id);
        return mod.exports;
      }

      // Initializes module exports.
      if (!mod.exports) {
        setExports(mod, sandbox);
      }

      return mod.exports;
    }

    return require;
  }

  function setExports(mod, sandbox) {
    var factory = mod.factory, ret;

    if (isFunction(factory)) {
      ret = factory.call(
          mod,
          new Require({ id: mod.id, parent: sandbox, deps: mod.dependencies }),
          (mod.exports = {}),
          mod);

      if (ret) mod.exports = ret;
    }
    else {
      mod.exports = factory || {};
    }
  }

  function isCyclic(sandbox, id) {
    if (sandbox.id === id) return true;
    if (sandbox.parent) return isCyclic(sandbox.parent, id);
    return false;
  }

  function printCyclicStack(sandbox, id) {
    if (global['console']) {
      var stack = id;
      while (sandbox) {
        stack += ' <-- ' + sandbox.id;
        sandbox = sandbox.parent;
      }
      console.warn('Found cyclic dependencies:', stack);
    }
  }


  //----------------------------------------------------------------------------
  // Members for "provide" and "declare"
  //----------------------------------------------------------------------------

  /**
   * Provides modules to the environment, and then fire callback.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   * @param {boolean=} noRequire For inner use.
   */
  function provide(ids, callback, noRequire) {
    ids = getUnmemoizedIds(canonicalize(ids));
    if (ids.length === 0) return cb();

    for (var i = 0, len = ids.length, remain = len; i < len; i++) {
      (function(id) {

        load(id, function() {
          var deps = (getProvidedMod(id) || 0).dependencies || [];
          var len = deps.length;

          if (len) {
            deps = getUnmemoizedIds(deps);
            remain += len;

            provide(deps, function() {
              remain -= len;
              if (remain === 0) cb();
            }, true);
          }

          //console.log('id =', id, 'remain =', remain - 1);
          if (--remain === 0) cb();
        });

      })(ids[i]);
    }

    function cb() {
      if (callback) {
        callback(noRequire ?
            undefined :
            new Require({ id: 'provide([' + ids + '])', deps: ids }));
      }
    }
  }


  /**
   * Declares a module.
   * @param {string=} id The module canonical id.
   * @param {Array.<string>} deps The module dependencies.
   * @param {function()|Object} factory The module factory function.
   */
  function declare(id, deps, factory) {
    // Overloads arguments.
    if (isArray(id)) {
      factory = deps;
      deps = id;
      id = '';
    }

    if (isIE876) {
      if (!id) {

        // For non-IE6-8 browsers, the script onload event may not fire right
        // after the the script is evaluated. Kris Zyp found for IE though that
        // in a function call that is called while the script is executed, it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script. Ref: http://goo.gl/JHfFW
        var script = getInteractiveScript();
        if (script) {
          id = url2id(script.src);
          //console.log(id, '[derived from interactive script]');
        }

        // In IE6-8, if the script is in the cache, the "interactive" mode
        // sometimes does not work. The script code actually executes *during*
        // the DOM insertion of the script tag, so we can keep track of which
        // script is being requested in case declare() is called during the DOM
        // insertion.
        else if (pendingModOldIE) {
          var diff = now() - pendingModOldIE.timestamp;
          if (diff < cacheTakenTime) {
            id = pendingModOldIE.id;
            //console.log(id, '[derived from pendingOldIE]', diff);
          }
        }

      }

      // Resets to avoid puzzling the next "declare".
      pendingModOldIE = null;

      // NOTE: If all the id-deriving methods above is failed, then falls back
      // to use onload event to get the module id.
    }

    var mod = { dependencies: deps, factory: factory };
    if (id) {
      // Memoizes to providedMods immediately.
      memoize(id, mod);

      // Resets to avoid polluting the context of onload event. An example:
      // Step1. First executes a 'declare([], fn)' in html code. This 'declare'
      // will set pendingMod = x.
      // Step2. Then loads a script including a 'declare(id, [], fn)'. If
      // pendingMod is not reset here, the cb in 'load' function will get wrong
      // pendingMod from Step1.
      pendingMod = null;
    }
    else {
      // Saves information for "real" work in the onload event.
      pendingMod = mod;
      //console.log('[set pendingMod for onload event]');
    }
  }


  /**
   * Downloads a module file.
   * @param {string} id The canonical module id.
   * @param {function()} callback The callback function.
   */
  function load(id, callback) {
    var url = fullpath(id);

    if (loadingMods[url]) {
      scriptOnload(loadingMods[url], cb);
    } else {
      if (isIE876) pendingModOldIE = { id: id, timestamp: now() };
      loadingMods[url] = getScript(url, cb);
    }

    function cb() {
      if (pendingMod) {
        memoize(id, pendingMod);
        // Resets immediately.
        pendingMod = null;
      }
      if (loadingMods[url]) delete loadingMods[url];
      if (callback) callback();
    }
  }


  var head = document.getElementsByTagName('head')[0];

  function getScript(url, callback) {
    var node = document.createElement('script');

    scriptOnload(node, function() {
      if (callback) callback.call(node);

      // Reduces memory leak.
      try {
        if (node.clearAttributes) {
          node.clearAttributes();
        } else {
          for (var p in node) delete node[p];
        }
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

    node.addEventListener('error', function() {
      console.error('404 error:', node.src);
      callback();
    }, false);
  }

  if (isIE876) {
    scriptOnload = function(node, callback) {
      node.attachEvent('onreadystatechange', function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          callback();
        }
      });
      // NOTE: In IE6-8, script node does not fire an "onerror" event when
      // node.src is 404.
    }
  }


  function getInteractiveScript() {
    var scripts = head.getElementsByTagName('script');
    var script, i = 0, len = scripts.length;

    for (; i < len; i++) {
      script = scripts[i];
      if (script.readyState === 'interactive') {
        return script;
      }
    }
  }


  //----------------------------------------------------------------------------
  // Static helpers
  //----------------------------------------------------------------------------

  /**
   * Extract the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b'
   * dirname('a/b/c') ==> 'a/b'
   * dirname('a/b/c/') ==> 'a/b/c'
   * dirname('d.js') ==> '.'
   * http://jsperf.com/regex-vs-split
   */
  function dirname(path) {
    var s = path.split('/').slice(0, -1).join('/');
    return s ? s : '.';
  }

  var realpathCache = {};
  /**
   * Canonicalize path.
   * realpath('a/b/c') ==> 'a/b/c'
   * realpath('a/b/../c') ==> 'a/c'
   * realpath('a/b/./c') ==> '/a/b/c'
   * realpath('a/b/c/') ==> 'a/b/c/'
   * http://jsperf.com/memoize
   */
  function realpath(path) {
    if (hasOwnProperty.call(realpathCache, path)) {
      return realpathCache[path];
    }
    else {
      var old = path.split('/');
      var ret = [], part, i, len;

      for (i = 0, len = old.length; i < len; i++) {
        part = old[i];
        if (part == '..') {
          if (ret.length === 0) {
            throw 'Invalid module path: ' + path;
          }
          ret.pop();
        } else if (part !== '.') {
          ret.push(part);
        }
      }

      return (realpathCache[path] = ret.join('/'));
    }
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

  // rel2abs('./b', 'sub/') ==> 'sub/b'
  // rel2abs('../b', 'sub/') ==> 'b'
  // rel2abs('b', 'sub/') ==> 'b'
  // rel2abs('a/b/../c', 'sub/') ==> 'a/c'
  function rel2abs(id, dir) {
    return realpath((id.indexOf('.') === 0) ? (dir + id) : id);
  }

  /**
   * Turns id to canonical id.
   * canonicalize(['./b'], 'submodule/a') ==> ['submodule/b']
   * canonicalize(['b'], 'submodule/a') ==> ['b']
   * canonicalize(['b/../c']) ==> ['c']
   * @param {Array.<string>|string} ids The raw module ids.
   * @param {string=} refId The reference module id.
   */
  function canonicalize(ids, refId) {
    var ret;
    var refDir = refId ? dirname(refId) + '/' : '';

    if (isArray(ids)) {
      var i = 0, len = ids.length;
      for (ret = []; i < len; i++) {
        ret.push(rel2abs(ids[i], refDir));
      }
    } else if (isString(ids)) {
      ret = rel2abs(ids, refDir);
    }

    return ret;
  }

  // url2id('http://path/main/a/b/c.js') ==> 'a/b/c'
  function url2id(url) {
    return url.replace(mainModDir + '/', '').replace(/\.js.*$/, '');
  }

  function getScriptAbsoluteSrc(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4);
  }


  //----------------------------------------------------------------------------
  // The main module entrance
  //----------------------------------------------------------------------------

  var mainModId = loaderScript.getAttribute('data-main');
  if (mainModId) provide([mainModId]);


  //----------------------------------------------------------------------------
  // Public API
  //----------------------------------------------------------------------------

  module.provide = provide;
  module.declare = declare;
  module.reset = reset;


})(this);


/**
 * TODO:
 *  - lang test
 *  - compare with BravoJS, FlyScript, RequireJS, YY
 *  - support packages
 *  - the relationship of SeaJS and KISSY
 *  - modules: lang, jquery
 *  - using('something').as('sth')
 *  - auto generate dependencies when combining multi modules.
 *  - timestamp for rebuild component
 */
