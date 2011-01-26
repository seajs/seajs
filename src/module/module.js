
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
module.seajs = '@VERSION@';


(function(global) {

  //----------------------------------------------------------------------------
  // The minimal language enhancement
  //----------------------------------------------------------------------------

  var toString = Object.prototype.toString;
  var hasOwnProperty = Object.prototype.hasOwnProperty;


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

  // Module status：
  // 1. downloaded - The module file has been downloaded to the browser.
  // 2. declared - The module declare function has been executed.
  // 3. provided - The module info has been added to providedMods.
  // 4. required -  mod.exports is available.

  // Modules that are being downloaded.
  // { uri: scriptNode, ... }
  var fetchingMods = {};

  // The modules that are declared, but has not been provided.
  var pendingMods = [];

  // For old IE.
  // { id: string, timestamp: number }
  var pendingModOldIE = null;
  var cacheTakenTime = 10;
  var isOldIE = !+'\v1'; // IE6-8

  // Cache for storing prefix.
  var prefixCache = null;

  // Modules that have been provided.
  // { uri: { dependencies: [], factory: fn, exports: {} }, ... }
  var providedMods = {};

  function memoize(uri, mod) {
    mod.dependencies = ids2Uris(mod.dependencies, uri, mod.prefix);
    providedMods[uri] = mod;
  }

  function getUnMemoized(uris) {
    var ret = [], i = 0, len = uris.length, uri;
    for (; i < len; i++) {
      uri = uris[i];
      if (!providedMods[uri]) {
        ret.push(uri);
      }
    }
    return ret;
  }


  //----------------------------------------------------------------------------
  // Provisioning: loads a module and gets it ready to be require()d.
  //----------------------------------------------------------------------------

  /**
   * Loads modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   */
  function load(ids, callback) {
    provide(ids, function(require) {
      var args = [];
      for (var i = 0, len = ids.length; i < len; i++) {
        args[i] = require(ids[i]);
      }
      callback && callback.apply(global, args);
    });
  }


  /**
   * Provides modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   * @param {boolean=} noRequire For inner use.
   */
  function provide(ids, callback, noRequire) {
    var originalUris = ids2Uris(ids);
    var uris = getUnMemoized(originalUris);
    if (uris.length === 0) return cb();

    for (var i = 0, len = uris.length, remain = len; i < len; i++) {
      (function(uri) {

        fetch(uri, function() {
          var deps = (providedMods[uri] || 0).dependencies || [];
          var len = deps.length;

          if (len) {
            deps = getUnMemoized(ids2Uris(deps));
            remain += len;

            provide(deps, function() {
              remain -= len;
              if (remain === 0) cb();
            }, true);
          }

          if (--remain === 0) cb();
        });

      })(uris[i]);
    }

    function cb() {
      if (callback) {
        callback(noRequire ?
            undefined :
            createRequire({
              deps: originalUris
            })
        );
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
    else if (isFunction(id)) {
      factory = id;
      deps = parseDeps(factory.toString());
      id = '';
    }

    var mod = { dependencies: deps, factory: factory };
    var uri;

    if (prefixCache) {
      mod.prefix = prefixCache;
      prefixCache = null;
    }

    if (isOldIE) {

      // For non-IE6-8 browsers, the script onload event may not fire right
      // after the the script is evaluated. Kris Zyp found for IE though that
      // in a function call that is called while the script is executed, it
      // could query the script nodes and the one that is in "interactive"
      // mode indicates the current script. Ref: http://goo.gl/JHfFW
      var script = getInteractiveScript();
      if (script) {
        uri = getScriptAbsoluteSrc(script);
      }

      // In IE6-8, if the script is in the cache, the "interactive" mode
      // sometimes does not work. The script code actually executes *during*
      // the DOM insertion of the script tag, so we can keep track of which
      // script is being requested in case declare() is called during the DOM
      // insertion.
      else if (pendingModOldIE) {
        var diff = now() - pendingModOldIE.timestamp;
        if (diff < cacheTakenTime) {
          uri = pendingModOldIE.uri;
        }
      }

      // Resets to avoid puzzling the next "declare".
      pendingModOldIE = null;

      // NOTE: If all the id-deriving methods above is failed, then falls back
      // to use onload event to get the module id.
    }

    if (uri) {
      if (id) uri = id2Uri('./' + id, uri);
      memoize(uri, mod);

      // Resets to avoid polluting the context of onload event. An example:
      // Step1. First executes a 'declare([], fn)' in html code. This 'declare'
      // will set pendingMod = x.
      // Step2. Then loads a script including a 'declare(id, [], fn)'. If
      // pendingMod is not reset here, the cb in 'load' function will get wrong
      // pendingMod from Step1.
      pendingMods = [];
    }
    else {
      // Saves information for "real" work in the onload event.
      mod.id = id;
      pendingMods.push(mod);
    }
  }


  /**
   * Fetches a module file.
   * @param {string} uri The canonical module id.
   * @param {function()} callback The callback function.
   */
  function fetch(uri, callback) {

    if (fetchingMods[uri]) {
      scriptOnload(fetchingMods[uri], cb);
    } else {
      if (isOldIE) pendingModOldIE = { uri: uri, timestamp: now() };
      fetchingMods[uri] = getScript(uri, cb);
    }

    function cb() {
      var len = pendingMods.length, i = 0, id, k = uri, mod;
      if (len) {
        for (; i < len; i++) {
          mod = pendingMods[i];
          id = mod.id; delete mod.id;
          if (id) k = id2Uri('./' + id, uri);
          memoize(k, mod);
        }
        pendingMods = [];
      }

      if (fetchingMods[uri]) delete fetchingMods[uri];
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

  if (isOldIE) {
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


  var interactiveScript = null;

  function getInteractiveScript() {
    if (interactiveScript && interactiveScript.readyState === 'interactive') {
      return interactiveScript;
    }

    var scripts = head.getElementsByTagName('script');
    var script, i = 0, len = scripts.length;

    for (; i < len; i++) {
      script = scripts[i];
      if (script.readyState === 'interactive') {
        return script;
      }
    }

    return null;
  }


  //----------------------------------------------------------------------------
  // require(): invokes module factory and returns module exports.
  //----------------------------------------------------------------------------

  /**
   * The factory of "require" function.
   * @param {Object} sandbox The data related to "require" instance.
   */
  function createRequire(sandbox) {
    // sandbox: {
    //   uri: '',
    //   deps: [],
    //   prefix: {},
    //   parent: sandbox
    // }

    return function(id) {
      var uri = id2Uri(id, sandbox.uri, sandbox.prefix);
      var mod;

      // Restrains to sandbox environment.
      if (indexOf(sandbox.deps, uri) === -1 || !(mod = providedMods[uri])) {
        throw 'Invalid module id: ' + id;
      }

      // Checks cyclic dependencies.
      if (isCyclic(sandbox, uri)) {
        console.warn('Found cyclic dependencies:', uri);
        return mod.exports;
      }

      // Initializes module exports.
      if (!mod.exports) {
        setExports(mod, {
          uri: uri,
          deps: mod.dependencies,
          prefix: mod.prefix,
          parent: sandbox
        });
      }

      return mod.exports;
    };
  }

  function setExports(mod, sandbox) {
    var factory = mod.factory, ret;
    delete mod.factory; // free

    if (isFunction(factory)) {
      ret = factory(
          createRequire(sandbox),
          (mod.exports = {}),
          (mod.declare = declare, mod.load = load, mod)
          );

      if (ret) mod.exports = ret;
    }
    else {
      mod.exports = factory || {};
    }
  }

  function isCyclic(sandbox, uri) {
    if (sandbox.uri === uri) return true;
    if (sandbox.parent) return isCyclic(sandbox.parent, uri);
    return false;
  }

  function parseDeps(code) {
    var pattern = /\brequire\s*\(\s*['"]?([^'")]*)/g;
    var ret = [], match;

    while ((match = pattern.exec(code))) {
      if (match[1]) ret.push(match[1]);
    }
    return ret;
  }


  //----------------------------------------------------------------------------
  // Static helpers
  //----------------------------------------------------------------------------

  /**
   * Extract the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b/'
   * dirname('a/b/c') ==> 'a/b/'
   * dirname('a/b/c/') ==> 'a/b/c/'
   * dirname('d.js') ==> './'
   * http://jsperf.com/regex-vs-split
   */
  function dirname(path) {
    var s = ('./' + path).replace(/(.*)?\/.*/, '$1').substring(2);
    return (s ? s : '.') + '/';
  }


  /**
   * Canonicalize path.
   * realpath('a/b/c') ==> 'a/b/c'
   * realpath('a/b/../c') ==> 'a/c'
   * realpath('a/b/./c') ==> '/a/b/c'
   * realpath('a/b/c/') ==> 'a/b/c/'
   * http://jsperf.com/memoize
   */
  function realpath(path) {
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
    return ret.join('/');
  }


  var location = global['location'];
  var pageUrl = location.protocol + '//' + location.host + location.pathname;

  /**
   * Converts id to uri.
   * @param {string} id The module ids.
   * @param {string=} refUri The referenced uri for relative id.
   * @param {Object=} prefix The prefix cache.
   */
  function id2Uri(id, refUri, prefix) {
    if (prefix) id = parsePrefix(id, prefix);
    id = id.replace(/\.js(?:\W.*)?$/, '');
    var ret;

    // absolute id
    if (id.indexOf('://') !== -1) {
      ret = id;
    }
    // relative id
    else if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
      ret = realpath(dirname(refUri || pageUrl) + id);
    }
    // root id
    else if (id.indexOf('/') === 0) {
      ret = getHost(refUri || pageUrl) + id;
    }
    // top-level id
    else {
      ret = seajsDir + id;
    }

    return ret + '.js';
  }


  /**
   * Converts ids to uris.
   * @param {Array.<string>} ids The module ids.
   * @param {string=} refUri The referenced uri for relative id.
   * @param {Object=} prefix The prefix cache.
   */
  function ids2Uris(ids, refUri, prefix) {
    var uris = [];
    for (var i = 0, len = ids.length; i < len; i++) {
      uris[i] = id2Uri(ids[i], refUri, prefix);
    }
    return uris;
  }


  function parsePrefix(id, prefix) {
    var p = id.indexOf('/');
    if (p > 0) {
      var key = id.substring(0, p);
      if (hasOwnProperty.call(prefix, key)) {
        id = prefix[key] + id.substring(p);
      }
    }
    return id;
  }


  function getHost(uri) {
    return uri.replace(/^(\w+:\/\/[^/]+)\/?.*$/, '$1');
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

  var scripts = document.getElementsByTagName('script');
  var loaderScript = scripts[scripts.length - 1];
  var seajsDir = dirname(getScriptAbsoluteSrc(loaderScript));

  var mainModId = loaderScript.getAttribute('data-main');
  if (mainModId) {
    // top-level id in "data-main" is relative to seajsHost.
    if (mainModId.indexOf('://') === -1 &&
        mainModId.indexOf('./') === -1 &&
        mainModId.charAt(0) !== '/') {
      mainModId = getHost(seajsDir) + '/' + mainModId;
    }
    load([mainModId]);
  }


  //----------------------------------------------------------------------------
  // Public API
  //----------------------------------------------------------------------------

  /**
   * Sets prefix for shorthand.
   */
  module.prefix = function(key, val) {
    prefixCache = prefixCache || {};
    prefixCache[key] = val;
    return this;
  };

  module.declare = declare;
  module.load = load;

})(this);
