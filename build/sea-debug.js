/*
Copyright 2011, SeaJS v1.0.0dev
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
seajs.version = '1.0.0dev';


// Module status：
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
  config: {
    /**
     * Debug mode. It will be turned off automatically when compressing.
     * @const
     */
    debug: '%DEBUG%'
  },

  /**
   * Modules that have been memoize()d.
   * { uri: { dependencies: [], factory: fn, exports: {} }, ... }
   */
  memoizedMods: {},

  /**
   * Store the module information for "real" work in the onload event.
   */
  pendingMods: []
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


  util.now = Date.now ? Date.now : function() {
    return new Date().getTime();
  };

})(seajs._util);

/**
 * @fileoverview The error handler.
 */

(function(util, data) {

  var config = data.config;


  /**
   * The function to handle inner errors.
   *
   * @param {Object} o The error object.
   */
  util.error = function(o) {

    // Throw errors.
    if (o.type === 'error') {
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

})(seajs._util, seajs._data);

/**
 * @fileoverview The utils for the framework.
 */

(function(util, data, global) {

  var config = data.config;


  /**
   * Extracts the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b/'
   * dirname('d.js') ==> './'
   * @see http://jsperf.com/regex-vs-split/2
   */
  function dirname(path) {
    var s = path.match(/.*(?=\/.*$)/);
    return (s ? s[0] : '.') + '/';
  }


  /**
   * Canonicalizes a path.
   * realpath('./a//b/../c') ==> 'a/c'
   */
  function realpath(path) {
    // 'file:///a//b/c' ==> 'file:///a/b/c'
    // 'http://a//b/c' ==> 'http://a/b/c'
    path = path.replace(/([^:\/])\/+/g, '$1\/');

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
          util.error({
            message: 'invalid path: ' + path,
            type: 'error'
          });
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

    // Adds the default '.js' extension except that the url ends with #.
    if (/#$/.test(url)) {
      url = url.slice(0, -1);
    }
    else {
      url = stripUrlArgs(realpath(url));

      if (!(/\.(?:css|js)$/.test(url))) {
        url += '.js';
      }
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


  var aliasRegCache = {};

  /**
   * Parses alias in the module id. Only parse the prefix and suffix.
   */
  function parseAlias(id) {
    var alias = config['alias'];

    var parts = id.split('/');
    var last = parts.length - 1;

    parse(parts, 0);
    if (last) parse(parts, last);

    function parse(parts, i) {
      var part = parts[i];
      var m;

      if (alias && alias.hasOwnProperty(part)) {
        parts[i] = alias[part];
      }
      // jquery:1.6.1 => jquery/1.6.1/jquery
      // jquery:1.6.1-debug => jquery/1.6.1/jquery-debug
      else if ((m = part.match(/(.+):([\d\.]+)(-debug)?/))) {
        parts[i] = m[1] + '/' + m[2] + '/' + m[1] + (m[3] ? m[3] : '');
      }
    }

    return parts.join('/');
  }


  /**
   * Gets the host portion from url.
   */
  function getHost(url) {
    return url.replace(/^(\w+:\/\/[^/]*)\/?.*$/, '$1');
  }


  var loc = global['location'];
  var pageUrl = loc.protocol + '//' + loc.host + loc.pathname;
  var id2UriCache = {};

  /**
   * Converts id to uri.
   * @param {string} id The module id.
   * @param {string=} refUrl The referenced uri for relative id.
   * @param {boolean=} noAlias When set to true, don't pass alias.
   */
  function id2Uri(id, refUrl, noAlias) {
    // only run once.
    if (id2UriCache[id]) {
      return id;
    }

    if (!noAlias) {
      id = parseAlias(id);
    }
    refUrl = refUrl || pageUrl;

    var ret;

    // absolute id
    if (id.indexOf('://') !== -1) {
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
      ret = getConfigBase() + '/' + id;
    }

    ret = normalize(ret);
    id2UriCache[ret] = true;

    return ret;
  }


  function getConfigBase() {
    if (!config.base) {
      util.error({
        message: 'the config.base is empty',
        from: 'id2Uri',
        type: 'error'
      });
    }
    return config.base;
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
  function memoize(id, url, mod) {
    url = stripUrlArgs(url);

    var uri;
    // define('id', [], fn)
    if (id) {
      uri = id2Uri(id, url, true);
    } else {
      uri = url;
    }

    mod.dependencies = ids2Uris(mod.dependencies, uri);
    data.memoizedMods[uri] = mod;

    // guest module in package
    if (id && url !== uri) {
      var host = memoizedMods[url];
      if (host) {
        augmentPackageHostDeps(host.dependencies, mod.dependencies);
      }
    }
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

  /**
   * For example:
   *  sbuild host.js --combo
   *   define('./host', ['./guest'], ...)
   *   define('./guest', ['jquery'], ...)
   * The jquery is not combined to host.js, so we should add jquery
   * to host.dependencies
   */
  function augmentPackageHostDeps(hostDeps, guestDeps) {
    for (var i = 0; i < guestDeps.length; i++) {
      if (util.indexOf(hostDeps, guestDeps[i]) === -1) {
        hostDeps.push(guestDeps[i]);
      }
    }
  }


  util.dirname = dirname;
  util.restoreUrlArgs = restoreUrlArgs;

  util.id2Uri = id2Uri;
  util.ids2Uris = ids2Uris;

  util.memoize = memoize;
  util.getUnMemoized = getUnMemoized;

  if (data.config.debug) {
    util.realpath = realpath;
    util.normalize = normalize;
    util.parseAlias = parseAlias;
    util.getHost = getHost;
  }

})(seajs._util, seajs._data, this);

/**
 * @fileoverview DOM utils for fetching script etc.
 */

(function(util, data) {

  var head = document.getElementsByTagName('head')[0];
  var isWebKit = navigator.userAgent.indexOf('AppleWebKit') !== -1;


  util.getAsset = function(url, callback, charset) {
    var isCSS = /\.css(?:\?|$)/i.test(url);
    var node = document.createElement(isCSS ? 'link' : 'script');
    if (charset) node.setAttribute('charset', charset);

    assetOnload(node, function() {
      if (callback) callback.call(node);
      if (isCSS) return;

      // Don't remove inserted node when debug is on.
      if (!data.config.debug) {
        try {
          // Reduces memory leak.
          if (node.clearAttributes) {
            node.clearAttributes();
          } else {
            for (var p in node) delete node[p];
          }
        } catch (x) {
        }
        head.removeChild(node);
      }
    });

    if (isCSS) {
      node.rel = 'stylesheet';
      node.href = url;
      head.appendChild(node); // keep order
    }
    else {
      node.async = true;
      node.src = url;
      head.insertBefore(node, head.firstChild);
    }

    return node;
  };

  function assetOnload(node, callback) {
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, cb);
    } else {
      styleOnload(node, cb);
    }

    var timer = setTimeout(function() {
      cb();
      util.error({
        message: 'time is out',
        from: 'getAsset',
        type: 'warn'
      });
    }, data.config.timeout);

    function cb() {
      cb.isCalled = true;
      callback();
      clearTimeout(timer);
    }
  }

  function scriptOnload(node, callback) {
    if (node.addEventListener) {
      node.addEventListener('load', callback, false);
      node.addEventListener('error', callback, false);
      // NOTICE: Nothing will happen in Opera when the file status is 404. In
      // this case, the callback will be called when time is out.
    }
    else { // for IE6-8
      node.attachEvent('onreadystatechange', function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          callback();
        }
      });
    }
  }

  function styleOnload(node, callback) {
    // for IE6-9 and Opera
    if (node.attachEvent) {
      node.attachEvent('onload', callback);
      // NOTICE:
      // 1. "onload" will be fired in IE6-9 when the file is 404, but in
      // this situation, Opera does nothing, so fallback to timeout.
      // 2. "onerror" doesn't fire in any browsers!
    }
    // polling for Firefox, Chrome, Safari
    else {
      setTimeout(function() {
        poll(node, callback);
      }, 0); // for cache
    }
  }

  function poll(node, callback) {
    if (callback.isCalled) {
      return;
    }

    var isLoaded = false;

    if (isWebKit) {
      if (node['sheet']) {
        isLoaded = true;
      }
    }
    // for Firefox
    else if (node['sheet']) {
      try {
        if (node['sheet'].cssRules) {
          isLoaded = true;
        }
      } catch (ex) {
        if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
          isLoaded = true;
        }
      }
    }

    if (isLoaded) {
      // give time to render.
      setTimeout(function() {
        callback();
      }, 1);
    }
    else {
      setTimeout(function() {
        poll(node, callback);
      }, 1);
    }
  }

  util.assetOnload = assetOnload;


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

})(seajs._util, seajs._data);

/**
 * references:
 *  - http://lifesinger.org/lab/2011/load-js-css/
 *  - ./test/issues/load-css/test.html
 */

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

    // normalize
    ids = util.ids2Uris(ids, this.uri);

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
   * @param {Array.<string>} uris An array composed of module uri.
   * @param {function(*)=} callback The callback function.
   * @param {boolean=} noRequire For inner use.
   */
  function provide(uris, callback, noRequire) {
    var that = this;
    var _uris = util.getUnMemoized(uris);

    if (_uris.length === 0) {
      return cb();
    }

    for (var i = 0, n = _uris.length, remain = n; i < n; i++) {
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

      })(_uris[i]);
    }

    function cb() {
      if (callback) {
        var require;

        if (!noRequire) {
          require = fn.createRequire({
            uri: that.uri,
            deps: uris
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
      util.assetOnload(fetchingMods[uri], cb);
    }
    else {
      // See fn-define.js: "uri = data.pendingModIE"
      data.pendingModIE = uri;

      fetchingMods[uri] = util.getAsset(
          getUrl(uri),
          cb,
          data.config.charset
          );

      data.pendingModIE = null;
    }

    function cb() {

      if (data.pendingMods) {

        for (var i = 0; i < data.pendingMods.length; i++) {
          var pendingMod = data.pendingMods[i];
          util.memoize(pendingMod.id, uri, pendingMod);
        }

        data.pendingMods = [];
      }

      if (fetchingMods[uri]) {
        delete fetchingMods[uri];
      }

      if (!memoizedMods[uri]) {
        util.error({
          message: 'can not memoized',
          from: 'load',
          uri: uri,
          type: 'warn'
        });
      }

      if (callback) {
        callback();
      }
    }
  }


  var timestamp = util.now();

  function getUrl(uri) {
    var url = util.restoreUrlArgs(uri);

    // When debug is 2, a unique timestamp will be added to each URL.
    // This can be useful during testing to prevent the browser from
    // using a cached version of the file.
    if (data.config.debug == 2) {
      url += (url.indexOf('?') === -1 ? '?' : '') +
          'seajs-timestamp=' + timestamp;
    }

    return url;
  }

})(seajs._util, seajs._data, seajs._fn, this);

/**
 * @fileoverview Module authoring format.
 */

(function(util, data, fn) {

  /**
   * Defines a module.
   * @param {string=} id The module id.
   * @param {Array.<string>=} deps The module dependencies.
   * @param {function()|Object} factory The module factory function.
   */
  fn.define = function(id, deps, factory) {

    // define(factory)
    if (arguments.length === 1) {
      factory = id;
      if (util.isFunction(factory)) {
        deps = parseDependencies(factory.toString());
      }
      id = '';
    }
    // define([], factory)
    else if (util.isArray(id)) {
      factory = deps;
      deps = id;
      id = '';
    }

    var mod = { id: id, dependencies: deps || [], factory: factory };
    var url;

    if (document.attachEvent && !window.opera) {
      // For IE6-9 browsers, the script onload event may not fire right
      // after the the script is evaluated. Kris Zyp found that it
      // could query the script nodes and the one that is in "interactive"
      // mode indicates the current script. Ref: http://goo.gl/JHfFW
      var script = util.getInteractiveScript();
      if (script) {
        url = util.getScriptAbsoluteSrc(script);
      }

      // In IE6-9, if the script is in the cache, the "interactive" mode
      // sometimes does not work. The script code actually executes *during*
      // the DOM insertion of the script tag, so we can keep track of which
      // script is being requested in case define() is called during the DOM
      // insertion.
      else {
        url = data.pendingModIE;
      }

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the module uri.
    }

    if (url) {
      util.memoize(id, url, mod);
    }
    else {
      // Saves information for "real" work in the onload event.
      data.pendingMods.push(mod);
    }

  };


  function parseDependencies(code) {
    var pattern = /\brequire\s*\(\s*['"]?([^'")]*)/g;
    var ret = [], match;

    code = removeComments(code);
    while ((match = pattern.exec(code))) {
      if (match[1]) {
        ret.push(match[1]);
      }
    }

    return ret;
  }


  // http://lifesinger.org/lab/2011/remove-comments-safely/
  function removeComments(code) {
    return code
        .replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n')
        .replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\n');
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
      var mod = data.memoizedMods[uri];

      // Just return null when:
      //  1. the module file is 404.
      //  2. the module file is not written with valid module format.
      //  3. other error cases.
      if (!mod) {
        return null;
      }

      // Checks cyclic dependencies.
      if (isCyclic(sandbox, uri)) {
        util.error({
          message: 'found cyclic dependencies',
          from: 'require',
          uri: uri,
          type: 'warn'
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
    mod.exports = {};
    mod.load = fn.load;
    delete mod.id; // just keep mod.uri
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
      util.error({
        message: 'found invalid setter: exports = {...}',
        from: 'require',
        uri: uri,
        type: 'error'
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


  // Async inserted script.
  var loaderScript = document.getElementById('seajsnode');

  // Static script.
  if (!loaderScript) {
    var scripts = document.getElementsByTagName('script');
    loaderScript = scripts[scripts.length - 1];
  }

  var src = util.getScriptAbsoluteSrc(loaderScript);
  if (src) {
    src = util.dirname(src);
    // When src is "http://test.com/libs/seajs/1.0.0/sea.js", redirect base
    // to "http://test.com/libs/"
    var match = src.match(/^(.+\/)seajs\/[\d\.]+\/$/);
    if (match) {
      src = match[1];
    }
    config.base = src;
  }
  // When script is inline code, src is empty.


  config.main = loaderScript.getAttribute('data-main') || '';


  // The max time to load a script file.
  config.timeout = 20000;


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
   *   timeout: 20000, // 20s
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

    // Make sure config.base is absolute path.
    var base = config.base;
    if (base.indexOf('://') === -1) {
      config.base = util.id2Uri(base + '#');
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
  host.config = fn.config;
  host.use = fn.use;

  // Module Authoring API:
  var previousDefine = global.define;
  global.define = fn.define;

  // For custom loader name.
  host.noConflict = function(all) {
    global.seajs = host._seajs;
    if (all) {
      global.define = previousDefine;
      host.define = fn.define;
    }
    return host;
  };

  // Keeps clean!
  if (!data.config.debug) {
    delete host._util;
    delete host._data;
    delete host._fn;
    delete host._seajs;
  }

})(seajs, seajs._data, seajs._fn, this);
