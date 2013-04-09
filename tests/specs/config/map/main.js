
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

  var t1 = require('./timestamp/t1')
  var t2 = require('./timestamp/t2')
  var t3 = require('./timestamp/t3')
  var t4 = require('./timestamp/t4')

  test.assert(t1.name === 't1', 't1.js')
  test.assert(t2.name === 't2', 't2.js')
  test.assert(t3.name === 't3', 't3.js')
  test.assert(t4.name === 't4', 't4.js')
  test.assert(find('t1.js').indexOf(TS) > 0, find('t1.js'))
  test.assert(find('t2.js').indexOf(TS) > 0, find('t2.js'))
  test.assert(find('t3.js').indexOf(TS) > 0, find('t3.js'))
  test.assert(find('t4.js').indexOf(TS) > 0, find('t4.js'))


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

