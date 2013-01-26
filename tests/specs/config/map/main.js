
seajs.config({
  map: [
    ['a.js', 'sub/a.js'],
    [/^(.+\/)b\.js(.*)$/, '$1sub/b.js$2'],
    [/^(.+\/)c\.js(.*)$/, function(m, m1, m2) {
      return m1 + 'sub/c.js' + m2
    }],
    function(url) {
      if (url.indexOf('d.js') > 0) {
        url = url.replace('/d.js', '/sub/d.js')
      }
      return url
    }
  ]
})


define(function(require) {

  var test = require('../../../test')


  var configData = seajs.config.data
  test.assert(configData.map.length === 4, configData.map.length)


  var a = require('./a')
  var b = require('./b')
  var c = require('./c')
  var d = require('./d')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)
  test.assert(c.name === 'c', c.name)
  test.assert(d.name === 'd', d.name)


  seajs.config({
    map: [
      ['a.js', 'sub/sub/a.js']
    ]})

  require.async('./a', function(a) {
    test.assert(configData.map.length === 5, configData.map.length)
    test.assert(a.name === 'a', a.name)
    test.next()
  })

});

