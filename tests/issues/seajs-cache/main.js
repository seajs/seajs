define(function(require) {

  var test = require('../../test')

  var a = require('./a')
  test.assert(a.name === 'a', a.name)
  test.assert(g === 1, 'g = ' + g)

  var cache = seajs.find('a.js')
  test.assert(cache.length === 1, 'cache.length = ' + cache.length)

  var m = cache[0]
  test.assert(m === a, m.name)


  var Module = seajs.pluginSDK.Module
  var url = require.resolve('./a')
  test.assert(url.indexOf('a.js') > 0, url)

  // 删除缓存
  delete Module.cache[url]
  delete Module.fetchedList[url]

  // 重新加载
  require.async('./a', function(a) {
    test.assert(g === 2, 'g = ' + g)
    test.assert(a.name === 'a', a.name)
    test.done()
  })

})
