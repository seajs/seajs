
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
    var ext = url.replace(/^.*(\..*)$/, '$1');
    if (!ext) url += '.js';

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
      id = ('/' + id).replace('/./', '/').substring(1);
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

  util.id2Uri = id2Uri;
  util.ids2Uris = ids2Uris;

  util.memoize = memoize;
  util.getUnMemoized = getUnMemoized;

})(seajs._util, seajs._data, this);
