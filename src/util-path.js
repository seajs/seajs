/**
 * util-path.js - The utilities for operating path such as id, uri
 */

var DIRNAME_RE = /[^?]*(?=\/.*$)/
var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g
var URI_END_RE = /\.(?:css|js)|\/$/
var ROOT_RE = /^(.*?\w)(?:\/|$)/
var VARS_RE = /{([^{}]+)}/g


// Extract the directory portion of a path
// dirname('a/b/c.js') ==> 'a/b/'
// dirname('d.js') ==> './'
// ref: http://jsperf.com/regex-vs-split/2
function dirname(path) {
  var s = path.match(DIRNAME_RE)
  return (s ? s[0] : '.') + '/'
}

// Canonicalize a path
// realpath('./a//b/../c') ==> 'a/c'
function realpath(path) {

  // 'file:///a//b/c' ==> 'file:///a/b/c'
  // 'http://a//b/c' ==> 'http://a/b/c'
  // 'https://a//b/c' ==> 'https://a/b/c'
  if (path.lastIndexOf('//') > 7) {
    path = path.replace(MULTIPLE_SLASH_RE, '$1\/')
  }

  // If 'a/b/c', just return
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

// Normalize an uri
// normalize('path/to/a') ==> 'path/to/a.js'
function normalize(uri) {
  // Call realpath() before adding extension, so that most of uris will
  // contains no `.` and will just return in realpath() call
  uri = realpath(uri)

  // Add the default `.js` extension except that the uri ends with `#`
  var lastChar = uri.charAt(uri.length - 1)
  if (lastChar === '#') {
    uri = uri.slice(0, -1)
  }
  else if (!URI_END_RE.test(uri) && uri.indexOf('?') === -1) {
    uri += '.js'
  }

  // Fixes `:80` bug in IE
  uri = uri.replace(':80/', '/')

  return uri
}


function parseAlias(id) {
  var alias = settings.alias

  // Only parse top-level id
  if (alias && hasOwn(alias, id) && isTopLevel(id)) {
    id = alias[id]
  }

  return id
}

function parseVars(id) {
  var vars = settings.vars

  if (vars && id.indexOf('{') > -1) {
    id = id.replace(VARS_RE, function(m, key) {
      return hasOwn(vars, key) ? vars[key] : '{' + key + '}'
    })
  }

  return id
}

function addBase(id, refUri) {
  var ret

  // absolute id
  if (isAbsolute(id)) {
    ret = id
  }
  // relative id
  else if (isRelative(id)) {
    // Convert './a' to 'a', to avoid unnecessary loop in realpath() call
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
    ret = settings.base + id
  }

  return ret
}

function parseMap(uri) {
  var map = settings.map || []
  var ret = uri
  var len = map.length

  if (len) {
    for (var i = 0; i < len; i++) {
      var rule = map[i]

      ret = isFunction(rule) ?
          (rule(uri) || uri) :
          uri.replace(rule[0], rule[1])

      // Only apply the first matched rule
      if (ret !== uri) break
    }
  }

  return ret
}

function id2Uri(id, refUri) {
  if (!id) return ''

  id = parseAlias(id)
  id = parseVars(id)
  id = addBase(id, refUri || pageUri)
  id = normalize(id)
  id = parseMap(id)

  return id
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


var doc = document

var pageUri = (function(loc) {
  var pathname = loc.pathname

  // Normalize pathname to start with '/'
  // ref: https://groups.google.com/forum/#!topic/seajs/9R29Inqk1UU
  if (pathname.charAt(0) !== '/') {
    pathname = '/' + pathname
  }

  var pageUri = loc.protocol + '//' + loc.host + pathname

  // local file in IE: C:\path\to\xx.js
  if (pageUri.indexOf('\\') > -1) {
    pageUri = pageUri.replace(/\\/g, '/')
  }

  return pageUri
})(global.location)

// Recommend to add `seajs-node` id for the `sea.js` script element
var loaderScript = doc.getElementById('seajs-node') || (function() {
  var scripts = doc.getElementsByTagName('script')

  return scripts[scripts.length - 1] ||
      // Maybe undefined in some environment such as PhantomJS
      doc.createElement('script')
})()

var loaderUri = getScriptAbsoluteSrc(loaderScript) ||
    pageUri // When `sea.js` is inline, loaderUri is pageUri


if (TEST_MODE) {
  test.dirname = dirname
  test.realpath = realpath
  test.normalize = normalize

  test.parseAlias = parseAlias
  test.parseVars = parseVars
  test.addBase = addBase
  test.parseMap = parseMap
  test.id2Uri = id2Uri

  test.pageUri = pageUri
  test.loaderUri = loaderUri
}


