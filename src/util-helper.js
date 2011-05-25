
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
   * Parses alias in the module id.
   */
  function parseAlias(id) {
    var alias = config['alias'];

    if (alias) {
      id = '/' + id + '/';
      for (var p in alias) {
        if (alias.hasOwnProperty(p)) {
          if (!aliasRegCache[p]) {
            aliasRegCache[p] = new RegExp('/' + p + '/');
          }
          id = id.replace(aliasRegCache[p], '/' + alias[p] + '/');
        }
      }
      id = id.slice(1, -1);
    }

    return id;
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
      ret = config.base + '/' + id;
    }

    ret = normalize(ret);
    id2UriCache[ret] = true;

    return ret;
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
  util.pageUrl = pageUrl;

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
