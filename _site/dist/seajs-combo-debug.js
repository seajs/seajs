(function(){
/**
 * The Sea.js plugin for concatenating HTTP requests
 */

var Module = seajs.Module
var FETCHING = Module.STATUS.FETCHING

var data = seajs.data
var comboHash = data.comboHash = {}

var comboSyntax = ["??", ","]
var comboMaxLength = 2000
var comboExcludes


seajs.on("load", setComboHash)
seajs.on("fetch", setRequestUri)

function setComboHash(uris) {
  var len = uris.length
  if (len < 2) {
    return
  }

  data.comboSyntax && (comboSyntax = data.comboSyntax)
  data.comboMaxLength && (comboMaxLength = data.comboMaxLength)

  comboExcludes = data.comboExcludes
  var needComboUris = []

  for (var i = 0; i < len; i++) {
    var uri = uris[i]

    if (comboHash[uri]) {
      continue
    }

    var mod = Module.get(uri)

    // Remove fetching and fetched uris, excluded uris, combo uris
    if (mod.status < FETCHING && !isExcluded(uri) && !isComboUri(uri)) {
      needComboUris.push(uri)
    }
  }

  if (needComboUris.length > 1) {
    paths2hash(uris2paths(needComboUris))
  }
}

function setRequestUri(data) {
  data.requestUri = comboHash[data.uri] || data.uri
}


// Helpers

function uris2paths(uris) {
  return meta2paths(uris2meta(uris))
}

// [
//   "http://example.com/p/a.js",
//   "https://example2.com/b.js",
//   "http://example.com/p/c/d.js",
//   "http://example.com/p/c/e.js"
// ]
// ==>
// {
//   "http__example.com": {
//                          "p": {
//                                 "a.js": { __KEYS: [] },
//                                 "c": {
//                                        "d.js": { __KEYS: [] },
//                                        "e.js": { __KEYS: [] },
//                                        __KEYS: ["d.js", "e.js"]
//                                 },
//                                 __KEYS: ["a.js", "c"]
//                               },
//                          __KEYS: ["p"]
//                        },
//   "https__example2.com": {
//                            "b.js": { __KEYS: [] },
//                            _KEYS: ["b.js"]
//                          },
//   __KEYS: ["http__example.com", "https__example2.com"]
// }

function uris2meta(uris) {
  var meta = {
    __KEYS: []
  }

  for (var i = 0, len = uris.length; i < len; i++) {
    var parts = uris[i].replace("://", "__").split("/")
    var m = meta

    for (var j = 0, l = parts.length; j < l; j++) {
      var part = parts[j]

      if (!m[part]) {
        m[part] = {
          __KEYS: []
        }
        m.__KEYS.push(part)
      }
      m = m[part]
    }
  }

  return meta
}

// {
//   "http__example.com": {
//                          "p": {
//                                 "a.js": { __KEYS: [] },
//                                 "c": {
//                                        "d.js": { __KEYS: [] },
//                                        "e.js": { __KEYS: [] },
//                                        __KEYS: ["d.js", "e.js"]
//                                 },
//                                 __KEYS: ["a.js", "c"]
//                               },
//                          __KEYS: ["p"]
//                        },
//   "https__example2.com": {
//                            "b.js": { __KEYS: [] },
//                            _KEYS: ["b.js"]
//                          },
//   __KEYS: ["http__example.com", "https__example2.com"]
// }
// ==>
// [
//   ["http://example.com/p", ["a.js", "c/d.js", "c/e.js"]]
// ]

function meta2paths(meta) {
  var paths = []
  var __KEYS = meta.__KEYS

  for (var i = 0, len = __KEYS.length; i < len; i++) {
    var part = __KEYS[i]
    var root = part
    var m = meta[part]
    var KEYS = m.__KEYS

    while (KEYS.length === 1) {
      root += "/" + KEYS[0]
      m = m[KEYS[0]]
      KEYS = m.__KEYS
    }

    if (KEYS.length) {
      paths.push([root.replace("__", "://"), meta2arr(m)])
    }
  }

  return paths
}

// {
//   "a.js": { __KEYS: [] },
//   "c": {
//          "d.js": { __KEYS: [] },
//          "e.js": { __KEYS: [] },
//          __KEYS: ["d.js", "e.js"]
//        },
//   __KEYS: ["a.js", "c"]
// }
// ==>
// [
//   "a.js", "c/d.js", "c/e.js"
// ]

function meta2arr(meta) {
  var arr = []
  var __KEYS = meta.__KEYS

  for (var i = 0, len = __KEYS.length; i < len; i++) {
    var key = __KEYS[i]
    var r = meta2arr(meta[key])

    // key = "c"
    // r = ["d.js", "e.js"]
    var m = r.length
    if (m) {
      for (var j = 0; j < m; j++) {
        arr.push(key + "/" + r[j])
      }
    } else {
      arr.push(key)
    }
  }

  return arr
}

// [
//   [ "http://example.com/p", ["a.js", "c/d.js", "c/e.js", "a.css", "b.css"] ]
// ]
// ==>
//
// a hash cache
//
// "http://example.com/p/a.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/c/d.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/c/e.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/a.css"  ==> "http://example.com/p/??a.css,b.css"
// "http://example.com/p/b.css"  ==> "http://example.com/p/??a.css,b.css"
//

function paths2hash(paths) {
  for (var i = 0, len = paths.length; i < len; i++) {
    var path = paths[i]
    var root = path[0] + "/"
    var group = files2group(path[1])

    for (var j = 0, m = group.length; j < m; j++) {
      setHash(root, group[j])
    }
  }

  return comboHash
}

function setHash(root, files) {
  var comboPath = root + comboSyntax[0] + files.join(comboSyntax[1])
  var exceedMax = comboPath.length > comboMaxLength

  // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
  if (files.length > 1 && exceedMax) {
    var parts = splitFiles(files,
      comboMaxLength - (root + comboSyntax[0]).length)

    setHash(root, parts[0])
    setHash(root, parts[1])
  } else {
    if (exceedMax) {
      throw new Error("The combo url is too long: " + comboPath)
    }

    for (var i = 0, len = files.length; i < len; i++) {
      comboHash[root + files[i]] = comboPath
    }
  }
}

function splitFiles(files, filesMaxLength) {
  var sep = comboSyntax[1]
  var s = files[0]

  for (var i = 1, len = files.length; i < len; i++) {
    s += sep + files[i]
    if (s.length > filesMaxLength) {
      return [files.splice(0, i), files]
    }
  }
}

//
//  ["a.js", "c/d.js", "c/e.js", "a.css", "b.css", "z"]
// ==>
//  [ ["a.js", "c/d.js", "c/e.js"], ["a.css", "b.css"] ]
//

function files2group(files) {
  var group = []
  var hash = {}

  for (var i = 0, len = files.length; i < len; i++) {
    var file = files[i]
    var ext = getExt(file)
    if (ext) {
      (hash[ext] || (hash[ext] = [])).push(file)
    }
  }

  for (var k in hash) {
    if (hash.hasOwnProperty(k)) {
      group.push(hash[k])
    }
  }

  return group
}

function getExt(file) {
  var p = file.lastIndexOf(".")
  return p >= 0 ? file.substring(p) : ""
}

function isExcluded(uri) {
  if (comboExcludes) {
    return comboExcludes.test ?
      comboExcludes.test(uri) :
      comboExcludes(uri)
  }
}

function isComboUri(uri) {
  var comboSyntax = data.comboSyntax || ["??", ","]
  var s1 = comboSyntax[0]
  var s2 = comboSyntax[1]

  return s1 && uri.indexOf(s1) > 0 || s2 && uri.indexOf(s2) > 0
}


  // For test
if (data.test) {
  var test = seajs.test || (seajs.test = {})
  test.uris2paths = uris2paths
  test.paths2hash = paths2hash
}

define("seajs/seajs-combo/1.0.1/seajs-combo-debug", [], {});
})();