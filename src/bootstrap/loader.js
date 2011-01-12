
/**
 * @fileoverview A module loader focused on web.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function() {

//==============================================================================
// Global Variables & Related Helpers
//==============================================================================

  // module status：
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
  var scripts = document.getElementsByTagName('script');
  var loaderScript = scripts[scripts.length - 1];
  var mainModDir = dirname(loaderScript.src);
  var mainModId = loaderScript.getAttribute('data-main');

  // reset loader enviroment.
  S.reset = function(dir) {
    pendingMod = null;
    providedMods = {};
    if(dir) mainModDir = dir;
  };

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

//==============================================================================
// Requiring Members
//==============================================================================

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
    if(ret) exports = ret;
    return exports;
  }

//==============================================================================
// Provisioning Members
//==============================================================================

  /**
   * provide modules to the environment, and then fire callback.
   */
  S.provide = function(ids, callback, norequire) {
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
            S.provide(deps, function() {
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
  };

  /**
   * declare a module to the environment.
   */
  S.declare = function(id, deps, factory) {
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
  };

  function load(id, callback) {
    // reset to avoid polluting by 'S.declare' without id in static script.
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
      if(loadingMods.url) delete loadingMods.url;
    }
  }

  var head = doc.getElementsByTagName('head')[0];

  function getScript(url, success) {
    var node = doc.createElement('script');
    node.src = url;
    node.async = true;

    scriptOnload(node, function() {
      if (success) success.call(node);

      for(var p in node) delete node.p;
      head.removeChild(node);
    });

    head.insertBefore(node, head.firstChild);
    return node;
  }

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
          if (oldCallback) oldCallback();
          callback.call(this);
        }
      };
    }
  }

//==============================================================================
// Static Helpers
//==============================================================================

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
   * Extract the non-directory portion of a path.
   * basename('a/b/c.js') ==> 'c.js'
   * basename('a/b/c') ==> 'c'
   * basename('a/b/') ==> ''
   */
  function basename(path) {
    return path.split('/').slice(-1)[0];
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

    for (i = 0,len = old.length; i < len; i++) {
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
    return realpath(mainModDir + '/' + id + '.js');
  }


  // for test
  S.providedMods = providedMods;

})();
