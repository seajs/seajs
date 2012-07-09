/**
 * Path utilities for the framework
 */
;(function(util, config, global) {

  var DIRNAME_RE = /.*(?=\/.*$)/
  var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g
  var FILE_EXT_RE = /\.(?:css|js)$/
  var ROOT_RE = /^(.*?\w)(?:\/|$)/


  /**
   * Extracts the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b/'
   * dirname('d.js') ==> './'
   * @see http://jsperf.com/regex-vs-split/2
   */
  function dirname(path) {
    var s = path.match(DIRNAME_RE)
    return (s ? s[0] : '.') + '/'
  }


  /**
   * Canonicalizes a path.
   * realpath('./a//b/../c') ==> 'a/c'
   */
  function realpath(path) {
    MULTIPLE_SLASH_RE.lastIndex = 0

    // 'file:///a//b/c' ==> 'file:///a/b/c'
    // 'http://a//b/c' ==> 'http://a/b/c'
    if (MULTIPLE_SLASH_RE.test(path)) {
      path = path.replace(MULTIPLE_SLASH_RE, '$1\/')
    }

    // 'a/b/c', just return.
    if (path.indexOf('.') === -1) {
      return path
    }

    var original = path.split('/')
    var ret = [], part

    for (var i = 0; i < original.length; i++) {
      part = original[i]

      if (part === '..') {
        if (ret.length === 0) {
          throw new Error('The path is invalid: ' + path)
        }
        ret.pop()
      }
      else if (part !== '.') {
        ret.push(part)
      }
    }

    return ret.join('/')
  }


  /**
   * Normalizes an uri.
   */
  function normalize(uri) {
    uri = realpath(uri)
    var lastChar = uri.charAt(uri.length - 1)

    if (lastChar === '/') {
      return uri
    }

    // Adds the default '.js' extension except that the uri ends with #.
    // ref: http://jsperf.com/get-the-last-character
    if (lastChar === '#') {
      uri = uri.slice(0, -1)
    }
    else if (uri.indexOf('?') === -1 && !FILE_EXT_RE.test(uri)) {
      uri += '.js'
    }

    // Remove ':80/' for bug in IE
    if (uri.indexOf(':80/') > 0) {
      uri = uri.replace(':80/', '/')
    }

    return uri
  }


  /**
   * Parses alias in the module id. Only parse the first part.
   */
  function parseAlias(id) {
    // #xxx means xxx is already alias-parsed.
    if (id.charAt(0) === '#') {
      return id.substring(1)
    }

    var alias = config.alias

    // Only top-level id needs to parse alias.
    if (alias && isTopLevel(id)) {
      var parts = id.split('/')
      var first = parts[0]

      if (alias.hasOwnProperty(first)) {
        parts[0] = alias[first]
        id = parts.join('/')
      }
    }

    return id
  }


  var mapCache = {}

  /**
   * Converts the uri according to the map rules.
   */
  function parseMap(uri) {
    // map: [[match, replace], ...]
    var map = config.map || []
    if (!map.length) return uri

    var ret = uri

    // Apply all matched rules in sequence.
    for (var i = 0; i < map.length; i++) {
      var rule = map[i]

      if (util.isArray(rule) && rule.length === 2) {
        var m = rule[0]

        if (util.isString(m) && ret.indexOf(m) > -1 ||
            util.isRegExp(m) && m.test(ret)) {
          ret = ret.replace(m, rule[1])
        }
      }
      else if (util.isFunction(rule)) {
        ret = rule(ret)
      }
    }

    if (ret !== uri) {
      mapCache[ret] = uri
    }

    return ret
  }


  /**
   * Gets the original uri.
   */
  function unParseMap(uri) {
    return mapCache[uri] || uri
  }


  /**
   * Converts id to uri.
   */
  function id2Uri(id, refUri) {
    if (!id) return ''

    id = parseAlias(id)
    refUri || (refUri = pageUri)

    var ret

    // absolute id
    if (isAbsolute(id)) {
      ret = id
    }
    // relative id
    else if (isRelative(id)) {
      // Converts './a' to 'a', to avoid unnecessary loop in realpath.
      if (id.indexOf('./') === 0) {
        id = id.substring(2)
      }
      ret = dirname(refUri) + id
    }
    // root id
    else if (isRoot(id)) {
      ret = refUri.match(ROOT_RE)[1] + id
    }
    // top-level id
    else {
      ret = config.base + '/' + id
    }

    return normalize(ret)
  }


  function isAbsolute(id) {
    return id.indexOf('://') > 0 || id.indexOf('//') === 0
  }


  function isRelative(id) {
    return id.indexOf('./') === 0 || id.indexOf('../') === 0
  }


  function isRoot(id) {
    return id.charAt(0) === '/' && id.charAt(1) !== '/'
  }


  function isTopLevel(id) {
    var c = id.charAt(0)
    return id.indexOf('://') === -1 && c !== '.' && c !== '/'
  }


  /**
   * Normalizes pathname to start with '/'
   * Ref: https://groups.google.com/forum/#!topic/seajs/9R29Inqk1UU
   */
  function normalizePathname(pathname) {
    if (pathname.charAt(0) !== '/') {
      pathname = '/' + pathname
    }
    return pathname
  }


  var loc = global['location']
  var pageUri = loc.protocol + '//' + loc.host +
      normalizePathname(loc.pathname)

  // local file in IE: C:\path\to\xx.js
  if (pageUri.indexOf('\\') > 0) {
    pageUri = pageUri.replace(/\\/g, '/')
  }


  util.dirname = dirname
  util.realpath = realpath
  util.normalize = normalize

  util.parseAlias = parseAlias
  util.parseMap = parseMap
  util.unParseMap = unParseMap

  util.id2Uri = id2Uri
  util.isAbsolute = isAbsolute
  util.isTopLevel = isTopLevel

  util.pageUri = pageUri

})(seajs._util, seajs._config, this)

