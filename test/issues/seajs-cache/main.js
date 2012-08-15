define(function(require) {

  var test = require('../../test')

  var a = require('a')
  test.assert(a.name === 'a', a.name)

  var cache = seajs.find('a.js')
  test.assert(cache.length === 2, cache.length)

  var m = cache[0]
  test.assert(m === a, m.name)

  test.done()
})
