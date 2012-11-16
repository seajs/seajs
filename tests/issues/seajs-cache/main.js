define(function(require) {

  var test = require('../../test')

  var a = require('./a')
  test.assert(a.name === 'a', a.name)

  var cache = seajs.find('a.js')
  test.assert(cache.length === 1, cache.length)

  var m = cache[0]
  test.assert(m === a, m.name)


  // 删除缓存
  var Module = seajs.pluginSDK.Module
  var url = require.resolve('./a')
  delete Module.cache[url]
  delete Module.fetchedList[url]

  // 重新加载
  require.async('./a', function(a) {
    test.assert(g === 2, g)
    test.assert(a.name === 'a', a.name)
    test.done()
  })

})
