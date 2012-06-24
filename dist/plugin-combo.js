/**
 * The combo plugin for apache modconcat or nginx http concat
 */
define('seajs/plugin-combo', function() {

  var pluginSDK = seajs.pluginSDK
  var util = pluginSDK.util


  // Hacks load function to inject combo support
  // -----------------------------------------------

  function hackLoad() {
    var MP = pluginSDK.Module.prototype
    var _load = MP._load

    MP._load = function(uris, callback) {
      uris.length > 1 && seajs.config({ map: paths2map(uris2paths(uris)) })
      _load.call(this, uris, callback)
    }
  }

  // No combo in debug mode
  if (!seajs.debug) hackLoad()


  // Uses map to implement combo support
  // -----------------------------------------------

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
  //   [ 'http://example.com/p', ['a.js', 'c/d.js', 'c/e.js'] ]
  // ]
  // ==>
  // [
  //   ['http://example.com/p/a.js': 'http://example.com/p/??a.js,c/d.js,c/e.js'],
  //   ['http://example.com/p/c/d.js': 'http://example.com/p/??a.js,c/d.js,c/e.js']
  //   ['http://example.com/p/c/e.js': 'http://example.com/p/??a.js,c/d.js,c/e.js']
  // ]
  function paths2map(paths) {
    var comboSyntax = pluginSDK.config.comboSyntax || ['??', ',']
    var map = []

    util.forEach(paths, function(path) {
      var root = path[0] + '/'
      var parts = path[1]
      var concat = root + comboSyntax[0] + parts.join(comboSyntax[1])

      util.forEach(parts, function(part) {
        map.push([ root + part, concat ])
      })
    })

    return map
  }


  // For test
  util.toComboPaths = uris2paths
  util.toComboMap = paths2map

});

// Runs it immediately
seajs.use('seajs/plugin-combo')

