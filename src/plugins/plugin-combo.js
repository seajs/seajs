/**
 * The combo plugin for http concat module
 */
(function(seajs) {

  var STATUS_FETCHING = 1

  var comboHash = {}
  var cachedModules = seajs.cache
  var configData = seajs.config.data

  seajs.on("load", setComboHash)
  seajs.on("fetch", setRequestUri)

  function setComboHash(uris) {
    var needComboUris = []
    var comboExcludes = configData.comboExcludes

    forEach(uris, function(uri) {
      var mod = cachedModules[uri]

      // Remove fetching and fetched uris, excluded uris, combo uris
      if (mod.status < STATUS_FETCHING &&
          (!comboExcludes || !comboExcludes.test(uri)) &&
          !isComboUri(uri)) {
        needComboUris.push(uri)
      }
    })

    if (needComboUris.length > 1) {
      paths2hash(uris2paths(needComboUris))
    }
  }

  function setRequestUri(data) {
    var uri = data.uri
    data.requestUri = comboHash[uri] || uri
  }


  // Helpers

  var forEach = [].forEach ?
      function(arr, fn) {
        arr.forEach(fn)
      } :
      function(arr, fn) {
        for (var i = 0; i < arr.length; i++) {
          fn(arr[i], i, arr)
        }
      }

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
    var meta = { __KEYS: [] }

    forEach(uris, function(uri) {
      var parts = uri.replace("://", "__").split("/")
      var m = meta

      forEach(parts, function(part) {
        if (!m[part]) {
          m[part] = { __KEYS: [] }
          m.__KEYS.push(part)
        }
        m = m[part]
      })

    })

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

    forEach(meta.__KEYS, function(part) {
      var root = part
      var m = meta[part]
      var KEYS = m.__KEYS

      while(KEYS.length === 1) {
        root += "/" + KEYS[0]
        m = m[KEYS[0]]
        KEYS = m.__KEYS
      }

      if (KEYS.length) {
        paths.push([root.replace("__", "://"), meta2arr(m)])
      }
    })

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

    forEach(meta.__KEYS, function(key) {
      var r = meta2arr(meta[key])

      // key = "c"
      // r = ["d.js", "e.js"]
      if (r.length) {
        forEach(r, function(part) {
          arr.push(key + "/" + part)
        })
      }
      else {
        arr.push(key)
      }
    })

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

    forEach(paths, function(path) {
      var root = path[0] + "/"
      var group = files2group(path[1])

      forEach(group, function(files) {
        setHash(root, files)
      })
    })

    return comboHash
  }

  function setHash(root, files) {
    var comboSyntax = configData.comboSyntax || ["??", ","]
    var comboMaxLength = configData.comboMaxLength || 2000

    var comboPath = root + comboSyntax[0] + files.join(comboSyntax[1])
    var exceedMax = comboPath.length > comboMaxLength

    // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
    if (files.length > 1 && exceedMax) {
      setHash(root, files.splice(0, Math.ceil(files.length / 2)))
      setHash(root, files)
    }
    else {
      if (exceedMax) {
        throw new Error("The combo url is too long: " + comboPath)
      }

      forEach(files, function(part) {
        comboHash[root + part] = comboPath
      })
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

    forEach(files, function(file) {
      var ext = getExt(file)
      if (ext) {
        (hash[ext] || (hash[ext] = [])).push(file)
      }
    })

    for (var ext in hash) {
      if (hash.hasOwnProperty(ext)) {
        group.push(hash[ext])
      }
    }

    return group
  }

  function getExt(file) {
    var p = file.lastIndexOf(".")
    return p >= 0 ? file.substring(p) : ""
  }

  function isComboUri(uri) {
    var comboSyntax = configData.comboSyntax || ["??", ","]
    var s1 = comboSyntax[0]
    var s2 = comboSyntax[1]

    return s1 && uri.indexOf(s1) > 0 || s2 && uri.indexOf(s2) > 0
  }


  // For test
  if (configData.test) {
    var test = seajs.test || (seajs.test = {})
    test.uris2paths = uris2paths
    test.paths2hash = paths2hash
  }

})(seajs);

