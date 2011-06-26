
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
    url = realpath(url);

    // Adds the default '.js' extension except that the url ends with #.
    if (/#$/.test(url)) {
      url = url.slice(0, -1);
    }
    else if (url.indexOf('?') === -1 && !/\.(?:css|js)$/.test(url)) {
      url += '.js';
    }

    return url;
  }


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
      if (alias && alias.hasOwnProperty(part)) {
        parts[i] = alias[part];
      }
    }

    return parts.join('/');
  }


  /**
   * Maps the module id.
   */
  function parseMap(url) {
    // config.map: [[match, replace], ...]

    util.forEach(config['map'], function(rule) {
      if (rule && rule.length === 2) {
        url = url.replace(rule[0], rule[1]);
      }
    });

    return url;
  }


  /**
   * Gets the host portion from url.
   */
  function getHost(url) {
    return url.replace(/^(\w+:\/\/[^/]*)\/?.*$/, '$1');
  }


  var loc = global['location'];
  var pageUrl = loc.protocol + '//' + loc.host + loc.pathname;

  // local file in IE: C:\path\to\xx.js
  if (pageUrl.indexOf('\\') !== -1) {
    pageUrl = pageUrl.replace(/\\/g, '/');
  }

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

    if (!noAlias && config['alias']) {
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
    if (config['map']) {
      ret = parseMap(ret);
    }

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
    return util.map(ids, function(id) {
      return id2Uri(id, refUri);
    });
  }


  var memoizedMods = data.memoizedMods;

  /**
   * Caches mod info to memoizedMods.
   */
  function memoize(id, url, mod) {
    var uri;

    // define('id', [], fn)
    if (id) {
      uri = id2Uri(id, url, true);
    } else {
      uri = url;
    }

    mod.dependencies = ids2Uris(mod.dependencies, uri);
    memoizedMods[uri] = mod;

    // guest module in package
    if (id && url !== uri) {
      var host = memoizedMods[url];
      if (host) {
        augmentPackageHostDeps(host.dependencies, mod.dependencies);
      }
    }
  }

  /**
   * Set mod.ready to true when all the requires of the module is loaded.
   */
  function setReadyState(uris) {
    util.forEach(uris, function(uri) {
      if (memoizedMods[uri]) {
        memoizedMods[uri].ready = true;
      }
    });
  }

  /**
   * Removes the "ready = true" uris from input.
   */
  function getUnReadyUris(uris) {
    return util.filter(uris, function(uri) {
      var mod = memoizedMods[uri];
      return !mod || !mod.ready;
    });
  }

  /**
   * if a -> [b -> [c -> [a, e], d]]
   * call removeMemoizedCyclicUris(c, [a, e])
   * return [e]
   */
  function removeCyclicWaitingUris(uri, deps) {
    return util.filter(deps, function(dep) {
      return !isCyclicWaiting(memoizedMods[dep], uri);
    });
  }

  function isCyclicWaiting(mod, uri) {
    if (!mod || mod.ready) {
      return false;
    }

    var deps = mod.dependencies || [];
    if (deps.length) {
      if (util.indexOf(deps, uri) !== -1) {
        return true;
      } else {
        for (var i = 0; i < deps.length; i++) {
          if (isCyclicWaiting(memoizedMods[deps[i]], uri)) {
            return true;
          }
        }
        return false;
      }
    }
    return false;
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
    util.forEach(guestDeps, function(guestDep) {
      if (util.indexOf(hostDeps, guestDep) === -1) {
        hostDeps.push(guestDep);
      }
    });
  }


  util.dirname = dirname;

  util.id2Uri = id2Uri;
  util.ids2Uris = ids2Uris;

  util.memoize = memoize;
  util.setReadyState = setReadyState;
  util.getUnReadyUris = getUnReadyUris;
  util.removeCyclicWaitingUris = removeCyclicWaitingUris;

  if (data.config.debug) {
    util.realpath = realpath;
    util.normalize = normalize;
    util.parseAlias = parseAlias;
    util.getHost = getHost;
  }

})(seajs._util, seajs._data, this);
