
/**
 * @fileoverview Core utilities for the framework.
 */

(function(util, data, fn, global) {

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
          util.error('Invalid path:', path);
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
   * Parses alias in the module id. Only parse the first part.
   */
  function parseAlias(id) {
    // #xxx means xxx is parsed.
    if (id.charAt(0) === '#') {
      return id.substring(1);
    }

    var alias;

    // Only top-level id needs to parse alias.
    if (isTopLevel(id) && (alias = config.alias)) {

      var parts = id.split('/');
      var first = parts[0];

      var has = alias.hasOwnProperty(first);
      if (has) {
        parts[0] = alias[first];
        id = parts.join('/');
      }
    }

    return id;
  }


  var mapCache = {};

  /**
   * Maps the module id.
   * @param {string} url The url string.
   * @param {Array=} map The optional map array.
   */
  function parseMap(url, map) {
    // config.map: [[match, replace], ...]
    map = map || config['map'] || [];
    if (!map.length) return url;
    var ret = url;

    util.forEach(map, function(rule) {
      if (rule && rule.length > 1) {
        ret = ret.replace(rule[0], rule[1]);
      }
    });

    mapCache[ret] = url;
    return ret;
  }


  /**
   * Gets the original url.
   * @param {string} url The url string.
   */
  function unParseMap(url) {
    return mapCache[url] || url;
  }


  /**
   * Gets the host portion from url.
   */
  function getHost(url) {
    return url.replace(/^(\w+:\/\/[^\/]*)\/?.*$/, '$1');
  }


  /**
   * Normalizes pathname to start with '/'
   * Ref: https://groups.google.com/forum/#!topic/seajs/9R29Inqk1UU
   */
  function normalizePathname(pathname) {
    if (pathname.charAt(0) !== '/') {
      pathname = '/' + pathname;
    }
    return pathname;
  }


  var loc = global['location'];
  var pageUrl = loc.protocol + '//' + loc.host +
      normalizePathname(loc.pathname);

  // local file in IE: C:\path\to\xx.js
  if (~pageUrl.indexOf('\\')) {
    pageUrl = pageUrl.replace(/\\/g, '/');
  }


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
    else if (isRelative(id)) {
      // Converts './a' to 'a', to avoid unnecessary loop in realpath.
      id = id.replace(/^\.\//, '');
      ret = dirname(refUrl) + id;
    }
    // root id
    else if (isRoot(id)) {
      ret = getHost(refUrl) + id;
    }
    // top-level id
    else {
      ret = config.base + '/' + id;
    }

    return normalize(ret);
  }


  function isAbsolute(id) {
    return ~id.indexOf('://') || id.indexOf('//') === 0;
  }


  function isRelative(id) {
    return id.indexOf('./') === 0 || id.indexOf('../') === 0;
  }


  function isRoot(id) {
    return id.charAt(0) === '/' && id.charAt(1) !== '/';
  }


  function isTopLevel(id) {
    var c = id.charAt(0);
    return id.indexOf('://') === -1 && c !== '.' && c !== '/';
  }


  util.dirname = dirname;
  util.realpath = realpath;
  util.normalize = normalize;

  util.parseAlias = parseAlias;
  util.parseMap = parseMap;
  util.unParseMap = unParseMap;

  util.id2Uri = id2Uri;
  util.isAbsolute = isAbsolute;
  util.isTopLevel = isTopLevel;

  util.pageUrl = pageUrl;

})(seajs._util, seajs._data, seajs._fn, this);
