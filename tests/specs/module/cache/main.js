
global.cache_g = 0

// For Node.js
var nodeRequireCache = typeof require !== 'undefined' ? require.cache : {}


define(function(require) {

  var test = require('../../../test')


  var a = require('./a')
  test.assert(a.name === 'a', a.name)
  test.assert(cache_g === 1, 'cache_g = ' + cache_g)

  var cache = find('module/cache/a.js')
  test.assert(cache.length === 1, 'cache.length = ' + cache.length)

  var m = cache[0]
  test.assert(m === require.resolve('./a'), m)


  var url = require.resolve('./a')
  test.assert(url.indexOf('a.js') > 0, url)


  // Delete './a' from cache and fetchedList
  delete seajs.cache[url]
  delete nodeRequireCache[url]
  seajs.on('fetch', deleteUrlFromFetchedList)

  function deleteUrlFromFetchedList(data) {
    if (data.uri === url) {
      delete data.fetchedList[data.uri]
    }
  }

  // Load './a' again
  require.async('./a', function(a) {
    test.assert(cache_g === 2, 'cache_g = ' + cache_g)
    test.assert(a.name === 'a', a.name)
    seajs.off('fetch', deleteUrlFromFetchedList)

    // Load from cache
    require.async('./a', function(a) {
      test.assert(cache_g === 2, 'cache_g = ' + cache_g)
      test.assert(a.name === 'a', a.name)

      test.next()
    })
  })


  function find(filename) {
    var cache = seajs.cache
    var ret = []

    for (var uri in cache) {
      if (uri.indexOf(filename) > 0) {
        ret.push(uri)
      }
    }

    return ret
  }

});

