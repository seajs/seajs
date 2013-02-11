/**
 * util-path.js - The utilities for operating path such as id, uri
 */

var DIRNAME_RE = /[^?]*(?=\/.*$)/
var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g
var URI_END_RE = /\?|\.(?:css|js)$|\/$/
var ROOT_RE = /^(.*?:\/\/.*?)(?:\/|$)/
var VARS_RE = /{([^{}]+)}/g


// Extract the directory portion of a path
// dirname("a/b/c.js") ==> "a/b/"
// dirname("d.js") ==> "./"
// ref: http://jsperf.com/regex-vs-split/2
function dirname(path) {
  var s = path.match(DIRNAME_RE)
  return (s ? s[0] : ".") + "/"
}

// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
function realpath(path) {

  // "file:///a//b/c" ==> "file:///a/b/c"
  // "http://a//b/c" ==> "http://a/b/c"
  // "https://a//b/c" ==> "https://a/b/c"
  if (path.lastIndexOf("//") > 7) {
    path = path.replace(MULTIPLE_SLASH_RE, "$1\/")
  }

  // If "a/b/c", just return
  if (path.indexOf(".") < 0) {
    return path
  }

  var ret = []
  var parts = path.split("/")
  var part

  for (var i = 0, len = parts.length; i < len; i++) {
    part = parts[i]

    if (part === "..") {
      ret.pop()
    }
    else if (part !== ".") {
      ret.push(part)
    }
  }

  return ret.join("/")
}

// Normalize an uri
// normalize("path/to/a") ==> "path/to/a.js"
function normalize(uri) {
  // Call realpath() before adding extension, so that most of uris will
  // contains no `.` and will just return in realpath() call
  uri = realpath(uri)

  // Add the default `.js` extension except that the uri ends with `#`
  var lastChar = uri.charAt(uri.length - 1)
  if (lastChar === "#") {
    uri = uri.slice(0, -1)
  }
  else if (!URI_END_RE.test(uri)) {
    uri += ".js"
  }

  // issue #256: fix `:80` bug in IE
  uri = uri.replace(":80/", "/")

  return uri
}


function parseAlias(id) {
  var alias = configData.alias

  // Only parse top-level id
  if (alias && hasOwn(alias, id) && isTopLevel(id)) {
    id = alias[id]
  }

  return id
}

function parseVars(id) {
  var vars = configData.vars

  if (vars && id.indexOf("{") >= 0) {
    id = id.replace(VARS_RE, function(m, key) {
      return hasOwn(vars, key) ? vars[key] : "{" + key + "}"
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
    // Convert "./a" to "a", to avoid unnecessary loop in realpath() call
    if (id.indexOf("./") === 0) {
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
    ret = configData.base + id
  }

  return ret
}

function parseMap(uri) {
  var map = configData.map || []
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
  if (!id) return ""

  id = parseAlias(id)
  id = parseVars(id)
  id = addBase(id, refUri || pageUri)
  id = normalize(id)
  id = parseMap(id)

  return id
}


function isAbsolute(id) {
  return id.indexOf("://") > 0 || id.indexOf("//") === 0
}

function isRelative(id) {
  return id.indexOf("./") === 0 || id.indexOf("../") === 0
}

function isRoot(id) {
  return id.charAt(0) === "/" && id.charAt(1) !== "/"
}

function isTopLevel(id) {
  var c = id.charAt(0)
  return id.indexOf("://") < 0 && c !== "." && c !== "/"
}


var doc = document
var loc = location
var pageUri = loc.href.replace(/[?#].*$/, "")

// Recommend to add `seajs-node` id for the `sea.js` script element
var loaderScript = doc.getElementById("seajsnode") || (function() {
  var scripts = doc.getElementsByTagName("script")
  return scripts[scripts.length - 1]
})()

// When `sea.js` is inline, set loaderDir according to pageUri
var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || pageUri)

function getScriptAbsoluteSrc(node) {
  return node.hasAttribute ? // non-IE6/7
      node.src :
    // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
      node.getAttribute("src", 4)
}


