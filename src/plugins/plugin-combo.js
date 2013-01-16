/**
 * The combo plugin for http concat module
 */
define('{seajs}/plugin-combo', [], function() {

  var pluginSDK = seajs.pluginSDK
  var STATUS = pluginSDK.Module.STATUS
  var util = pluginSDK.util
  var config = pluginSDK.config

  var comboHash = {}
  var cachedModules = seajs.cache


  // Turns off combo in debug mode.
  if (seajs.debug) {
    seajs.log('Combo is turned off in debug mode')
  }
  // Adds combo support via events.
  else {
    seajs.on('load', function(uris) {
      setComboHash(uris)
    })

    seajs.on('fetch', function(data) {
      var uri = data.uri
      data.uri = comboHash[uri] || uri
    })
  }


  function setComboHash(uris) {
    var validUris = []
    var comboExcludes = config.comboExcludes

    util.forEach(uris, function(uri) {
      var mod = cachedModules[uri]

      // Removes fetching uri, excluded uri and combo uri.
      if ((!mod || mod.status < STATUS.LOADING) &&
          (!comboExcludes || !comboExcludes.test(uri)) && !isComboUri(uri)) {
        validUris.push(uri)
      }
    })

    if (validUris.length > 1) {
      paths2hash(uris2paths(validUris))
    }
  }


  // Helpers
  // -------

  function uris2paths(uris) {
    return meta2paths(uris2meta(uris))
  }

  // [
  //   'http://example.com/p/a.js',
  //   'https://example2.com/b.js',
  //   'http://example.com/p/c/d.js',
  //   'http://example.com/p/c/e.js'
  // ]
  // ==>
  // {
  //   'http__example.com': {
  //                          'p': {
  //                                 'a.js': { __KEYS: [] },
  //                                 'c': {
  //                                        'd.js': { __KEYS: [] },
  //                                        'e.js': { __KEYS: [] },
  //                                        __KEYS: ['d.js', 'e.js']
  //                                 },
  //                                 __KEYS: ['a.js', 'c']
  //                               },
  //                          __KEYS: ['p']
  //                        },
  //   'https__example2.com': {
  //                            'b.js': { __KEYS: [] },
  //                            _KEYS: ['b.js']
  //                          },
  //   __KEYS: ['http__example.com', 'https__example2.com']
  // }
  function uris2meta(uris) {
    var meta = { __KEYS: [] }

    util.forEach(uris, function(uri) {
      var parts = uri.replace('://', '__').split('/')
      var m = meta

      util.forEach(parts, function(part) {
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
  //   'http__example.com': {
  //                          'p': {
  //                                 'a.js': { __KEYS: [] },
  //                                 'c': {
  //                                        'd.js': { __KEYS: [] },
  //                                        'e.js': { __KEYS: [] },
  //                                        __KEYS: ['d.js', 'e.js']
  //                                 },
  //                                 __KEYS: ['a.js', 'c']
  //                               },
  //                          __KEYS: ['p']
  //                        },
  //   'https__example2.com': {
  //                            'b.js': { __KEYS: [] },
  //                            _KEYS: ['b.js']
  //                          },
  //   __KEYS: ['http__example.com', 'https__example2.com']
  // }
  // ==>
  // [
  //   ['http://example.com/p', ['a.js', 'c/d.js', 'c/e.js']]
  // ]
  function meta2paths(meta) {
    var paths = []

    util.forEach(meta.__KEYS, function(part) {
      var root = part
      var m = meta[part]
      var KEYS = m.__KEYS

      while(KEYS.length === 1) {
        root += '/' + KEYS[0]
        m = m[KEYS[0]]
        KEYS = m.__KEYS
      }

      if (KEYS.length) {
        paths.push([root.replace('__', '://'), meta2arr(m)])
      }
    })

    return paths
  }


  // {
  //   'a.js': { __KEYS: [] },
  //   'c': {
  //          'd.js': { __KEYS: [] },
  //          'e.js': { __KEYS: [] },
  //          __KEYS: ['d.js', 'e.js']
  //        },
  //   __KEYS: ['a.js', 'c']
  // }
  // ==>
  // [
  //   'a.js', 'c/d.js', 'c/e.js'
  // ]
  function meta2arr(meta) {
    var arr = []

    util.forEach(meta.__KEYS, function(key) {
      var r = meta2arr(meta[key])

      // key = 'c'
      // r = ['d.js', 'e.js']
      if (r.length) {
        util.forEach(r, function(part) {
          arr.push(key + '/' + part)
        })
      }
      else {
        arr.push(key)
      }
    })

    return arr
  }


  // [
  //   [ 'http://example.com/p', ['a.js', 'c/d.js', 'c/e.js', 'a.css', 'b.css'] ]
  // ]
  // ==>
  //
  // a hash cache
  //
  // 'http://example.com/p/a.js'  ==> 'http://example.com/p/??a.js,c/d.js,c/e.js'
  // 'http://example.com/p/c/d.js'  ==> 'http://example.com/p/??a.js,c/d.js,c/e.js'
  // 'http://example.com/p/c/e.js'  ==> 'http://example.com/p/??a.js,c/d.js,c/e.js'
  // 'http://example.com/p/a.css'  ==> 'http://example.com/p/??a.css,b.css'
  // 'http://example.com/p/b.css'  ==> 'http://example.com/p/??a.css,b.css'
  //
  function paths2hash(paths) {
    var comboSyntax = config.comboSyntax || ['??', ',']

    util.forEach(paths, function(path) {
      var root = path[0] + '/'
      var group = files2group(path[1])

      util.forEach(group, function(files) {
        var comboPath = root + comboSyntax[0] + files.join(comboSyntax[1])

        // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
        if (comboPath.length > 2000) {
          throw new Error('The combo url is too long: ' + comboPath)
        }

        util.forEach(files, function(part) {
          comboHash[root + part] = comboPath
        })
      })

    })
  }


  //
  //  ['a.js', 'c/d.js', 'c/e.js', 'a.css', 'b.css', 'z']
  // ==>
  //  [ ['a.js', 'c/d.js', 'c/e.js'], ['a.css', 'b.css'] ]
  //
  function files2group(files) {
    var group = []
    var hash = {}

    util.forEach(files, function(file) {
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
    var p = file.lastIndexOf('.')
    return p >= 0 ? file.substring(p) : ''
  }


  function isComboUri(uri) {
    var comboSyntax = config.comboSyntax || ['??', ',']
    var s1 = comboSyntax[0]
    var s2 = comboSyntax[1]

    return s1 && uri.indexOf(s1) > 0 || s2 && uri.indexOf(s2) > 0
  }


  // For test
  util.toComboPaths = uris2paths
  util.toComboHash = paths2hash
  util.comboHash = comboHash

})

// Runs it immediately
seajs.use('{seajs}/plugin-combo');

