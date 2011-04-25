/*
Copyright 2011, SeaJS v0.9.0-dev
MIT Licensed
build time: ${build.time}
*/


/**
 * @fileoverview A CommonJS module loader, focused on web.
 * @author lifesinger@gmail.com (Frank Wang)
 */


/**
 * Base namespace for the framework.
 */
this.seajs = { _seajs: this.seajs };


/**
 * @type {string} The version of the framework. It will be replaced
 * with "major.minor.patch" when building.
 */
seajs.version = '%VERSION%';


// Module status\uff1a
//  1. downloaded - The script file has been downloaded to the browser.
//  2. define()d - The define() has been executed.
//  3. memoize()d - The module info has been added to memoizedMods.
//  4. require()d -  The module.exports is available.


/**
 * The private data. Internal use only.
 */
seajs._data = {

  /**
   * The configuration data.
   */
  config: {},

  /**
   * Modules that have been memoize()d.
   * { uri: { dependencies: [], factory: fn, exports: {} }, ... }
   */
  memoizedMods: {}
};


/**
 * The private utils. Internal use only.
 */
seajs._util = {};


/**
 * The inner namespace for methods. Internal use only.
 */
seajs._fn = {};

/**
 * @fileoverview The error handler.
 */

(function(data, fn) {

  var config = data.config;

  /**
   * Enum for error types.
   * @enum {number}
   */
  data.errorCodes = {
    LOAD: 40,
    REQUIRE: 41,
    CYCLIC: 42,
    EXPORTS: 43
  };


  /**
   * The function to handle inner errors.
   *
   * @param {Object} o The error object.
   */
  fn.error = function(o) {
    var code = o.code;

    // Call custom error handler.
    if (config.error && config.error[code]) {
      config.error[o](o);
    }
    // Throw errors.
    else if (o.type === 'error') {
      throw 'Error occurs! ' + dump(o);
    }
    // Output debug info.
    else if (config.debug && typeof console !== 'undefined') {
      console[o.type](dump(o));
    }
  };

  function dump(o) {
    var out = ['{'];

    for (var p in o) {
      if (typeof o[p] === 'number' || typeof o[p] === 'string') {
        out.push(p + ': ' + o[p]);
        out.push(', ');
      }
    }
    out.pop();
    out.push('}');

    return out.join('');
  }

})(seajs._data, seajs._fn);

/**
 * @fileoverview The minimal language enhancement.
 */

(function(util) {

  var toString = Object.prototype.toString;


  util.isString = function(val) {
    return toString.call(val) === '[object String]';
  };


  util.isFunction = function(val) {
    return toString.call(val) === '[object Function]';
  };


  util.isArray = Array.isArray ? Array['isArray'] : function(val) {
    return toString.call(val) === '[object Array]';
  };


  util.indexOf = Array.prototype.indexOf ?
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

})(seajs._util);

/**
 * @fileoverview The utils for the framework.
 */

(function(util, data, global) {

  var config = data.config;


  /**
   * Extracts the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b/'
   * dirname('d.js') ==> './'
   */
  function dirname(path) {
    var s = ('./' + path).replace(/(.*)?\/.*/, '$1').substring(2);
    return (s ? s : '.') + '/';
  }


  /**
   * Canonicalizes a path.
   * realpath('./a//b/../c') ==> 'a/c'
   */
  function realpath(path) {
    // 'a//b/c' ==> 'a/b/c'
    path = path.replace(/([^:]\/)\/+/g, '$1');

    // 'a/b/c', just return.
    if (path.indexOf('.') === -1) {
      return path;
    }

    var old = path.split('/');
    var ret = [], part, i = 0, len = old.length;

    for (; i < len; i++) {
      part = old[i];
      if (part === '..') {
        if (ret.length === 0) {
          throw 'Invalid path: ' + path;
        }
        ret.pop();
      }
      else if (part !== '.') {
        ret.push(part);
      }
    }

    return ret.join('/');
  }


  /**
   * Normalizes an url.
   */
  function normalize(url) {
    url = stripUrlArgs(realpath(url));

    // Adds the default '.js' ext.
    if (url.lastIndexOf('.') <= url.lastIndexOf('/')) {
      url += '.js';
    }

    return url;
  }


  /**
   * Url args cache.
   * { uri: args, ... }
   */
  var urlArgs = {};

  /**
   * Strips off the args from url and caches it.
   */
  function stripUrlArgs(url) {
    var m = url.match(/^([^?]+)(\?.*)$/);
    if (m) {
      url = m[1];
      urlArgs[url] = m[2];
    }
    return url;
  }

  /**
   * Restores the args for url.
   */
  function restoreUrlArgs(url) {
    return url + (urlArgs[url] || '');
  }


  /**
   * Checks id is absolute path.
   */
  function isAbsolute(id) {
    return (id.indexOf('://') !== -1);
  }


  /**
   * Parses alias in the module id.
   */
  function parseAlias(id) {
    if (isAbsolute(id)) return id;

    var alias = config['alias'];
    if (alias) {
      var parts = id.split('/');
      var len = parts.length;
      var i = 0;

      while (i < len) {
        var val = alias[parts[i]];
        if (val) {
          parts[i] = val;
        }
        i++;
      }
      id = parts.join('/');
    }
    return id;
  }


  /**
   * Gets the host portion from url.
   */
  function getHost(url) {
    return url.replace(/^(\w+:\/\/[^/]+)\/?.*$/, '$1');
  }


  var loc = global['location'];
  var pageUrl = loc.protocol + '//' + loc.host + loc.pathname;

  /**
   * Converts id to uri.
   * @param {string} id The module id.
   * @param {string=} refUrl The referenced uri for relative id.
   */
  function id2Uri(id, refUrl) {
    id = parseAlias(id);
    refUrl = refUrl || pageUrl;

    var ret;

    // absolute id
    if (isAbsolute(id)) {
      ret = id;
    }
    // relative id
    else if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
      // Converts './a' to 'a', to avoid unnecessary loop in realpath.
      id = id.replace(/^\.\//, '');
      ret = dirname(refUrl) + id;
    }
    // root id
    else if (id.indexOf('/') === 0) {
      ret = getHost(refUrl) + id;
    }
    // top-level id
    else {
      ret = config.base + '/' + id;
    }

    return normalize(ret);
  }


  /**
   * Converts ids to uris.
   * @param {Array.<string>} ids The module ids.
   * @param {string=} refUri The referenced uri for relative id.
   */
  function ids2Uris(ids, refUri) {
    var uris = [];

    for (var i = 0, len = ids.length; i < len; i++) {
      uris[i] = id2Uri(ids[i], refUri);
    }

    return uris;
  }


  var memoizedMods = data.memoizedMods;

  /**
   * Caches mod info to memoizedMods.
   */
  function memoize(uri, mod) {
    mod.dependencies = ids2Uris(mod.dependencies, uri);
    data.memoizedMods[uri] = mod;
  }

  /**
   * Removes the memoize()d uris from input.
   */
  function getUnMemoized(uris) {
    var ret = [];
    for (var i = 0; i < uris.length; i++) {
      var uri = uris[i];
      if (!memoizedMods[uri]) {
        ret.push(uri);
      }
    }
    return ret;
  }


  util.dirname = dirname;
  util.restoreUrlArgs = restoreUrlArgs;
  util.getHost = getHost;
  util.pageUrl = pageUrl;

  util.id2Uri = id2Uri;
  util.ids2Uris = ids2Uris;

  util.memoize = memoize;
  util.getUnMemoized = getUnMemoized;

})(seajs._util, seajs._data, this);

/**
 * @fileoverview DOM utils for fetching script etc.
 */

(function(util) {

  var head = document.getElementsByTagName('head')[0];

  util.getScript = function(url, callback, charset) {
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

    if (charset) node.setAttribute('charset', charset);
    node.async = true;
    node.src = url;
    return head.insertBefore(node, head.firstChild);
  };

  function scriptOnload(node, callback) {
    node.addEventListener('load', callback, false);
    node.addEventListener('error', callback, false);
  }

  if (!head.addEventListener) {
    scriptOnload = function(node, callback) {
      node.attachEvent('onreadystatechange', function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          callback();
        }
      });
    }
  }

  util.scriptOnload = scriptOnload;


  var interactiveScript = null;

  util.getInteractiveScript = function() {
    if (interactiveScript && interactiveScript.readyState === 'interactive') {
      return interactiveScript;
    }

    var scripts = head.getElementsByTagName('script');

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      if (script.readyState === 'interactive') {
        return script;
      }
    }

    return null;
  };


  util.getScriptAbsoluteSrc = function(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4);
  };

})(seajs._util);

/**
 * @fileoverview Loads a module and gets it ready to be require()d.
 */

(function(util, data, fn, global) {

  /**
   * Modules that are being downloaded.
   * { uri: scriptNode, ... }
   */
  var fetchingMods = {};

  var memoizedMods = data.memoizedMods;


  /**
   * Loads modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   */
  fn.load = function(ids, callback) {
    if (util.isString(ids)) {
      ids = [ids];
    }

    // 'this' may be seajs or module, due to seajs.boot() or module.load().
    provide.call(this, ids, function(require) {
      var args = [];

      for (var i = 0; i < ids.length; i++) {
        args[i] = require(ids[i]);
      }

      if (callback) {
        callback.apply(global, args);
      }
    });

    return this;
  };


  /**
   * Provides modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   * @param {boolean=} noRequire For inner use.
   */
  function provide(ids, callback, noRequire) {
    var that = this;
    var originalUris = util.ids2Uris(ids, that.uri);
    var uris = util.getUnMemoized(originalUris);

    if (uris.length === 0) {
      return cb();
    }

    for (var i = 0, n = uris.length, remain = n; i < n; i++) {
      (function(uri) {

        fetch(uri, function() {
          var deps = (memoizedMods[uri] || 0).dependencies || [];
          var m = deps.length;

          if (m) {
            remain += m;

            provide(deps, function() {
              remain -= m;
              if (remain === 0) cb();
            }, true);
          }

          if (--remain === 0) cb();
        });

      })(uris[i]);
    }

    function cb() {
      if (callback) {
        var require;

        if (!noRequire) {
          require = fn.createRequire({
            uri: that.uri,
            deps: originalUris
          });
        }

        callback(require);
      }
    }
  }


  /**
   * Fetches a module file.
   * @param {string} uri The module uri.
   * @param {function()} callback The callback function.
   */
  function fetch(uri, callback) {

    if (fetchingMods[uri]) {
      util.scriptOnload(fetchingMods[uri], cb);
    }
    else {
      // See fn-define.js: "uri = data.pendingModIE"
      data.pendingModIE = uri;

      fetchingMods[uri] = util.getScript(
          util.restoreUrlArgs(uri),
          cb,
          data.config.charset
          );

      data.pendingModIE = null;
    }

    function cb() {
      if (data.pendingMod) {
        util.memoize(uri, data.pendingMod);
        data.pendingMod = null;
      }

      if (fetchingMods[uri]) {
        delete fetchingMods[uri];
      }

      if (!memoizedMods[uri]) {
        var stop = fn.error({
          code: data.errorCodes.LOAD,
          message: 'can not memoized',
          type: 'warn',
          from: 'load',
          uri: uri,
          callback: callback
        });

        if (stop) {
          return;
        }
      }

      if (callback) {
        callback();
      }
    }
  }

})(seajs._util, seajs._data, seajs._fn, this);

/**
 * @fileoverview Module authoring format.
 */

(function(util, data, fn) {

  /**
   * Defines a module.
   * @param {string=} id The module canonical id.
   * @param {Array.<string>=} deps The module dependencies.
   * @param {function()|Object} factory The module factory function.
   */
  fn.define = function(id, deps, factory) {

    // Overloads arguments.
    if (util.isArray(id)) {
      factory = deps;
      deps = id;
      id = '';
    }
    else if (!util.isString(id)) {
      factory = id;
      if (util.isFunction(factory)) {
        deps = parseDependencies(factory.toString());
      }
      id = '';
    }

    var mod = { id: id, dependencies: deps || [], factory: factory };
    var uri;

    if (document.attachEvent && !window.opera) {
      // For IE6-9 browsers, the script onload event may not fire right
      // after the the script is evaluated. Kris Zyp found that it
      // could query the script nodes and the one that is in "interactive"
      // mode indicates the current script. Ref: http://goo.gl/JHfFW
      var script = util.getInteractiveScript();
      if (script) {
        uri = util.getScriptAbsoluteSrc(script);
      }

      // In IE6-9, if the script is in the cache, the "interactive" mode
      // sometimes does not work. The script code actually executes *during*
      // the DOM insertion of the script tag, so we can keep track of which
      // script is being requested in case define() is called during the DOM
      // insertion.
      else {
        uri = data.pendingModIE;
      }

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the module uri.
    }

    if (uri) {
      util.memoize(uri, mod);
    } else {
      // Saves information for "real" work in the onload event.
      data.pendingMod = mod;
    }

  };


  function parseDependencies(code) {
    var pattern = /\brequire\s*\(\s*['"]?([^'")]*)/g;
    var ret = [], match;

    while ((match = pattern.exec(code))) {
      if (match[1]) {
        ret.push(match[1]);
      }
    }

    return ret;
  }

})(seajs._util, seajs._data, seajs._fn);

/**
 * @fileoverview The factory for "require".
 */

(function(util, data, fn) {

  /**
   * The factory of "require" function.
   * @param {Object} sandbox The data related to "require" instance.
   */
  function createRequire(sandbox) {
    // sandbox: {
    //   uri: '',
    //   deps: [],
    //   parent: sandbox
    // }

    function require(id) {
      var uri = util.id2Uri(id, sandbox.uri);
      var mod;

      // Restrains to sandbox environment.
      if (util.indexOf(sandbox.deps, uri) === -1 ||
          !(mod = data.memoizedMods[uri])) {

        fn.error({
          code: data.errorCodes.REQUIRE,
          message: 'invalid module',
          type: 'warn',
          from: 'require',
          uri: uri
        });

        // Just return null when:
        //  1. the module file is 404.
        //  2. the module file is not written with valid module format.
        //  3. other error cases.
        return null;
      }

      // Checks cyclic dependencies.
      if (isCyclic(sandbox, uri)) {

        fn.error({
          code: data.errorCodes.CYCLIC,
          message: 'found cyclic dependencies',
          type: 'warn',
          from: 'require',
          uri: uri
        });

        return mod.exports;
      }

      // Initializes module exports.
      if (!mod.exports) {
        initExports(mod, {
          uri: uri,
          deps: mod.dependencies,
          parent: sandbox
        });
      }

      return mod.exports;
    }

    return require;
  }

  function initExports(mod, sandbox) {
    var ret;
    var factory = mod.factory;

    // Attaches members to module instance.
    //mod.dependencies
    mod.uri = sandbox.uri;
    mod.id = mod.id || mod.uri;
    mod.exports = {};
    mod.load = fn.load;
    delete mod.factory; // free

    if (util.isFunction(factory)) {
      checkPotentialErrors(factory, mod.uri);
      ret = factory(createRequire(sandbox), mod.exports, mod);
      if (ret) {
        mod.exports = ret;
      }
    } else {
      mod.exports = factory || {};
    }
  }

  function isCyclic(sandbox, uri) {
    if (sandbox.uri === uri) {
      return true;
    }
    if (sandbox.parent) {
      return isCyclic(sandbox.parent, uri);
    }
    return false;
  }

  function checkPotentialErrors(factory, uri) {
    if (factory.toString().search(/\sexports\s*=\s*[^=]/) !== -1) {
      fn.error({
        code: data.errorCodes.EXPORTS,
        message: 'found invalid setter: exports = {...}',
        type: 'error',
        from: 'require',
        uri: uri
      });
    }
  }

  fn.createRequire = createRequire;

})(seajs._util, seajs._data, seajs._fn);

/**
 * @fileoverview The configuration.
 */

(function(util, data, fn) {

  var config = data.config;


  /**
   * Debug mode. It will be turned off automatically when compressing.
   * @const
   */
  config.debug = '%DEBUG%';


  // Async inserted script.
  var loaderScript = document.getElementById('seajsnode');

  // Static script.
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script');
    loaderScript = scripts[scripts.length - 1];
  }

  // When script is inline code, src is pageUrl.
  var src = util.getScriptAbsoluteSrc(loaderScript) || util.pageUrl;
  config.base = util.dirname(src);

  config.main = loaderScript.getAttribute('data-main') || '';


  /**
   * The function to configure the framework.
   * config({
   *   'base': 'path/to/base',
   *   'alias': {
   *     'app': 'biz/xx',
   *     'jquery': 'jquery-1.5.2',
   *     'cart': 'cart?t=20110419'
   *   },
   *   charset: 'utf-8',
   *   debug: false,
   *   main: './init'
   * });
   *
   * @param {Object} o The config object.
   */
  fn.config = function(o) {
    for (var k in o) {
      var sub = config[k];
      if (typeof sub === 'object') {
        mix(sub, o[k]);
      } else {
        config[k] = o[k];
      }
    }
    return this;
  };

  function mix(r, s) {
    for (var k in s) {
      r[k] = s[k];
    }
  }

})(seajs._util, seajs._data, seajs._fn);

/**
 * @fileoverview The bootstrap and entrances.
 */

(function(host, data, fn) {

  var config = data.config;

  fn.use = fn.load;

  var mainModuleId = config.main;
  if (mainModuleId) {
    fn.use([mainModuleId]);
  }

  // Parses the pre-call of seajs.config/seajs.boot/define.
  // Ref: test/bootstrap/async-3.html
  (function(args) {
    if (args) {
      var hash = {
        0: 'config',
        1: 'use',
        2: 'define'
      };
      for (var i = 0; i < args.length; i += 2) {
        fn[hash[args[i]]].apply(host, args[i + 1]);
      }
      delete host._seajs;
    }
  })((host._seajs || 0)['args']);

})(seajs, seajs._data, seajs._fn);

/**
 * @fileoverview The public api of seajs.
 */

(function(host, data, fn, global) {

  // Avoids conflicting when sea.js is loaded multi times.
  if (host._seajs) {
    global.seajs = host._seajs;
    return;
  }

  // SeaJS Loader API:
  host.use = fn.use;
  host.config = fn.config;

  // Module Authoring API:
  global.define = fn.define;

  // Keeps clean!
  if (!data.config.debug) {
    delete host._util;
    delete host._data;
    delete host._fn;
  }

})(seajs, seajs._data, seajs._fn, this);
