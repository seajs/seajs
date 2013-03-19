/**
 * util-path.js - The utilities for operating path such as id, uri
 */

var DIRNAME_RE = /[^?#]*\//

var DOT_RE = /\/\.\//g
var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g
var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//g

var URI_END_RE = /\?|\.(?:css|js)$|\/$/
var HASH_END_RE = /#$/

// Extract the directory portion of a path
// dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
// ref: http://jsperf.com/regex-vs-split/2
function dirname(path) {
  return path.match(DIRNAME_RE)[0]
}

// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
function realpath(path) {
  // /a/b/./c/./d ==> /a/b/c/d
  path = path.replace(DOT_RE, "/")

  // "file:///a//b/c"  ==> "file:///a/b/c"
  // "http://a//b/c"   ==> "http://a/b/c"
  // "https://a//b/c"  ==> "https://a/b/c"
  // "/a/b//"          ==> "/a/b/"
  path = path.replace(MULTIPLE_SLASH_RE, "$1\/")

  // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
  while (path.match(DOUBLE_DOT_RE)) {
    path = path.replace(DOUBLE_DOT_RE, "/")
  }

  return path
}

// Normalize an uri
// normalize("path/to/a") ==> "path/to/a.js"
function normalize(uri) {
  // Call realpath() before adding extension, so that most of uris will
  // contains no `.` and will just return in realpath() call
  uri = realpath(uri)

  // Add the default `.js` extension except that the uri ends with `#`
  if (HASH_END_RE.test(uri)) {
    uri = uri.slice(0, -1)
  }
  else if (!URI_END_RE.test(uri)) {
    uri += ".js"
  }

  // issue #256: fix `:80` bug in IE
  return uri.replace(":80/", "/")
}


var PATHS_RE = /^([^/:]+)(\/.+)$/
var VARS_RE = /{([^{]+)}/g

function parseAlias(id) {
  var alias = configData.alias
  return alias && isString(alias[id]) ? alias[id] : id
}

function parsePaths(id) {
  var paths = configData.paths
  var m

  if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
    id = paths[m[1]] + m[2]
  }

  return id
}

function parseVars(id) {
  var vars = configData.vars

  if (vars && id.indexOf("{") > -1) {
    id = id.replace(VARS_RE, function(m, key) {
      return isString(vars[key]) ? vars[key] : m
    })
  }

  return id
}

function parseMap(uri) {
  var map = configData.map
  var ret = uri

  if (map) {
    for (var i = 0; i < map.length; i++) {
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


var ABSOLUTE_RE = /:\//
var RELATIVE_RE = /^\./
var ROOT_RE = /^\//

function isAbsolute(id) {
  return ABSOLUTE_RE.test(id)
}

function isRelative(id) {
  return RELATIVE_RE.test(id)
}

function isRoot(id) {
  return ROOT_RE.test(id)
}


var ROOT_DIR_RE = /^.*?\/\/.*?\//

function addBase(id, refUri) {
  var ret

  if (isAbsolute(id)) {
    ret = id
  }
  else if (isRelative(id)) {
    ret = dirname(refUri || cwd) + id
  }
  else if (isRoot(id)) {
    ret = (cwd.match(ROOT_DIR_RE) || ["/"])[0] + id.substring(1)
  }
  // top-level id
  else {
    ret = configData.base + id
  }

  return ret
}

function id2Uri(id, refUri) {
  if (!id) return ""

  id = parseAlias(id)
  id = parsePaths(id)
  id = parseVars(id)
  id = addBase(id, refUri)
  id = normalize(id)
  id = parseMap(id)

  return id
}


var doc = document
var loc = location
var cwd = dirname(loc.href)
var scripts = doc.getElementsByTagName("script")

// Recommend to add `seajs-node` id for the `sea.js` script element
var loaderScript = doc.getElementById("seajsnode") ||
    scripts[scripts.length - 1]

// When `sea.js` is inline, set loaderDir to current working directory
var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript)) || cwd

function getScriptAbsoluteSrc(node) {
  return node.hasAttribute ? // non-IE6/7
      node.src :
    // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
      node.getAttribute("src", 4)
}

// Get/set current working directory
seajs.cwd = function(val) {
  return val ? (cwd = realpath(val + "/")) : cwd
}

