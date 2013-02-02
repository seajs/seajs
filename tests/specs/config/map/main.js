
seajs.config({
  map: [
    ['/map/a.js', '/map/sub/a.js'],

    [/^(.+\/)b\.js(.*)$/, '$1sub/b.js$2'],

    [/^(.+\/)c\.js(.*)$/, function(m, m1, m2) {
      return m1 + 'sub/c.js' + m2
    }],

    function(url) {
      if (url.indexOf('d.js') > 0) {
        url = url.replace('/d.js', '/sub/d.js')
      }
      return url
    },

    ['/debug/a.js', '/debug/a-debug.js'],

    function(url) {
      if (url.indexOf('/map/timestamp/') > 0) {
        return url + '?t=20130202'
      }
    }
  ]
})


define(function(require) {

  var test = require('../../../test')


  var configData = seajs.config.data
  test.assert(configData.map.length === 6, configData.map.length)


  var a = require('./a')
  var b = require('./b')
  var c = require('./c')
  var d = require('./d')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)
  test.assert(c.name === 'c', c.name)
  test.assert(d.name === 'd', d.name)


  var debugA = require('./debug/a')
  test.assert(debugA.name === 'a', a.name)


  var TS = '?t=20130202'

  var ta = require('./timestamp/ta')
  var tb = require('./timestamp/tb')
  var tc = require('./timestamp/tc')
  var td = require('./timestamp/td')

  test.assert(ta.name === 'a', 'ta.js')
  test.assert(tb.name === 'b', 'tb.js')
  test.assert(tc.name === 'c', 'tc.js')
  test.assert(td.name === 'd', 'td.js')
  test.assert(find('ta.js').indexOf(TS) > 0, find('ta.js'))
  test.assert(find('tb.js').indexOf(TS) > 0, find('tb.js'))
  test.assert(find('tc.js').indexOf(TS) > 0, find('tc.js'))
  test.assert(find('td.js').indexOf(TS) > 0, find('td.js'))


  seajs.config({
    map: [
      ['/map/a.js', 'sub/sub/a.js']
    ]})

  require.async('./a', function(a) {
    test.assert(configData.map.length === 7, configData.map.length)
    test.assert(a.name === 'a', a.name)
    test.next()
  })


  function find(filename) {
    for(var uri in seajs.cache) {
      if (uri.indexOf(filename) > 0) {
        return uri
      }
    }
  }

});

