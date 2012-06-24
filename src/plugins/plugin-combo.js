/**
 * The combo plugin for apache modconcat or nginx http concat
 */
define('seajs/plugin-combo', function() {

  // No combo in debug mode
  if (seajs.debug) return


  var pluginSDK = seajs.pluginSDK
  var util = pluginSDK.util
  var Module = pluginSDK.Module


  // Hacks load function to inject combo support
  // -----------------------------------------------

  var _load = Module._load

  Module._load = function(uris, callback) {
    seajs.config({ map: paths2map(uris2paths(uris)) })
    _load(uris, callback)
  }


  // Uses map to implement combo support
  // -----------------------------------------------

  function uris2paths(uris) {
    return meta2paths(uris2meta(uris))
  }

  // [
  //   'http://example.com/p/a.js',
  //   'https://example2.com/b.js',
  //   'http://example.com/p/c/d.js'
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
    var ENDS = []

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

    meta.__ENDS = ENDS
    return meta
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
  function meta2paths(meta) {
    var paths = []

    util.forEach(meta.__KEYS, function(key) {
      var r = meta2paths(meta[key])

      // key = 'c'
      // r = ['d.js', 'e.js']
      if (r.length) {
        util.forEach(r, function(part) {
          paths.push(key + '/' + part)
        })
      }
      else {
        paths.push(key)
      }
    })

    return paths
  }


  var comboSyntax = pluginSDK.config.comboSyntax || ['??', ',']

  // [
  //   [ 'http__example.com/p', ['a.js', 'c/d.js', 'c/e.js'] ]
  // ]
  // ==>
  // [
  //   ['http://example.com/p/a.js': 'http://example.com/p/??a.js,c/d.js,c/e.js'],
  //   ['http://example.com/p/c/d.js': 'http://example.com/p/??a.js,c/d.js,c/e.js']
  //   ['http://example.com/p/c/e.js': 'http://example.com/p/??a.js,c/d.js,c/e.js']
  // ]
  function paths2map(paths) {
    var map = []

    util.forEach(paths, function(path) {
      var root = path[0].replace('__', '://') + '/'
      var parts = path[1]
      var concat = root + comboSyntax[0] + parts.join(comboSyntax[1])

      util.forEach(parts, function(part) {
        map.push([ root + part, concat ])
      })
    })

    return map
  }

  // For test
  util.uris2paths = uris2paths

});

