
/**
 * @fileoverview A module loader focused on web.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function() {

  //============================================================================
  // Global Variables & Related Helpers
  //============================================================================

  // module status：
  // 1. downloaded - The module file has been downloaded to the browser.
  // 2. declared - The module declare function has been executed.
  // 3. provided - The module info has been added to providedMods.
  // 4. required -  mod.exports is available.

  // modules that are beening downloaded.
  var loadingMods = {};

  // the module that is declared, but has not been provided.
  var pendingMod = null;

  // for IE6-8
  var isIE876 = !+'\v1';
  var pendingModOldIE = null;
  var cacheTakenTime = 10;

  // modules that have beed provided.
  // { uri: { id: string, dependencies: [], factory: function }, ... }
  var providedMods = {};

  // init mainModDir and mainModId.
  var scripts = document.getElementsByTagName('script');
  var loaderScript = scripts[scripts.length - 1];
  var mainModDir = dirname(getScriptAbsSrc(loaderScript));
  var mainModId = loaderScript.getAttribute('data-main');

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

  // Turns each id to canonical id.
  // canonicalize(['./b'], 'submodule/a') ==> ['submodule/b']
  // canonicalize(['b'], 'submodule/a') ==> ['b']
  // canonicalize(['b/../c']) ==> ['c']
  function canonicalize(ids, refId) {
    var ret;
    var refDir = refId ? dirname(refId) + '/' : '';

    if (S.isArray(ids)) {
      var i = 0, len = ids.length;
      for (ret = []; i < len; i++) {
        ret.push(rel2abs(ids[i], refDir));
      }
    } else if (S.isString(ids)) {
      ret = rel2abs(ids, refDir);
    }

    return ret;
  }

  // realid('./b', 'sub/') ==> 'sub/b'
  // realid('../b', 'sub/') ==> 'b'
  // realid('b', 'sub/') ==> 'b'
  // realid('a/b/../c', 'sub/') ==> 'a/c'
  function rel2abs(id, dir) {
    return realpath((id.indexOf('.') === 0) ? (dir + id) : id);
  }

  //============================================================================
  // Requiring Members
  //============================================================================

  /**
   * @constructor
   */
  function Require(sandbox) {
    sandbox = sandbox || { deps: [] };

    function require(id) {
      id = canonicalize(id, sandbox.id);
      var mod = getProvidedMod(id);

      // avoid cyclic
      if (isCyclic(sandbox, id)) {
        S.log('cyclic dependencies: id = ' + id, 'warn');
        return (mod || 0).exports;
      }

      // restrain to sandbox environment
      if (!S.inArray(sandbox.deps, id) || !mod) {
        return S.error('Module ' + id + ' is not provided.');
      }

      if (!mod.exports) {
        setExports(mod, sandbox);
      }

      return mod.exports;
    }

    return require;
  }

  function setExports(mod, sandbox) {
    var factory = mod.factory, ret;

    if (S.isFunction(factory)) {
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

  //============================================================================
  // Provisioning Members
  //============================================================================

  /**
   * provide modules to the environment, and then fire callback.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   * @param {boolean=} norequire For inner use.
   */
  function provide(ids, callback, norequire) {
    ids = getUnmemoizedIds(canonicalize(ids));
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
      if (callback) {
        callback(norequire ? undefined : new Require({ deps: ids }));
      }
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

    // For non-IE6-8 browsers, the script onload event may not fire right
    // after the the script is evaluated. Kris Zyp found for IE though that in
    // a function call that is called while the script is executed, it could
    // query the script nodes and the one that is in "interactive" mode
    // indicates the current script. see http://goo.gl/JHfFW
    if (!id && isIE876) {
      var script = getInteractiveScript();
      if (script) {
        id = url2id(script.src);
        //S.log(id + ' [derived from interactive script]');
      }
      // In IE6-8, if the script is in the cache, the "interactive" mode
      // sometimes does not work. The script code actually executes *during*
      // the DOM insertion of the script tag, so we can keep track of which
      // script is being requested in case declare() is called during the DOM
      // insertion.
      else if (pendingModOldIE) {
        var diff = S.now() - pendingModOldIE.timestamp;
        if (diff < cacheTakenTime) {
          id = pendingModOldIE.id;
          //S.log(id + ' [derived from pendingOldIE] diff = ' + diff);
        }
        pendingModOldIE = null;
      }
      // If all the id-deriving above is failed, then falls back to using
      // script onload to get the module id.
    }

    var mod = { dependencies: deps, factory: factory };

    if (id) {
      memoize(id, mod);
      // if a file contains multi declares, a declare without id is valid
      // only when it is the last one.
      pendingMod = null;
    }
    else {
      pendingMod = mod;
      //S.log('[set pendingMod for onload event]');
    }
  }

  function load(id, callback) {
    // reset to avoid polluting by declare without id in static script.
    pendingMod = null;
    var url = fullpath(id);

    if (loadingMods[url]) {
      scriptOnload(loadingMods[url], cb);
    } else {
      if (isIE876) pendingModOldIE = { id: id, timestamp: S.now() };
      loadingMods[url] = getScript(url, cb);
    }

    function cb() {
      if (pendingMod) {
        memoize(id, pendingMod);
        pendingMod = null;
      }
      if (callback) callback();
      if (loadingMods[url]) delete loadingMods[url];
    }
  }

  var head = document.getElementsByTagName('head')[0];

  function getScript(url, success) {
    var node = document.createElement('script');

    scriptOnload(node, function() {
      if (success) success.call(node);

      // reduce memory leak
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
  }

  if (isIE876) {
    scriptOnload = function(node, callback) {
      node.attachEvent('onreadystatechange', function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          callback && callback.call(this);
        }
      });
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

  // url2id('http://path/main/a/b/c.js') ==> 'a/b/c'
  function url2id(url) {
    return url.replace(mainModDir + '/', '')
              .replace('.js', '');
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

  //============================================================================
  // Public API
  //============================================================================

  S.declare = declare;
  S.provide = provide;
  S.reset = reset;

})();

/**
 * TODO:
 *  - more test
 *  - compare with BravoJS, FlyScript, RequireJS, YY
 *  - modules: lang, jquery
 *  - S.using('something').as('sth')
 *  - auto generate dependencies when concating multi modules.
 *  - timestamp for rebuild component
 */
