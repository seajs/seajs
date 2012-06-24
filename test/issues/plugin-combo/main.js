define(function(require) {

  var test = require('../../test')
  var util = seajs.pluginSDK.util


  var uris = [
    'http://example.com/p/a.js',
    'https://example2.com/b.js',
    'http://example.com/p/c/d.js',
    'http://example.com/p/c/e.js'
  ]

  // paths = [
  //           [ 'http://example.com/p', ['a.js', 'c/d.js', 'c/e.js'] ]
  //         ]
  var paths = util.toComboPaths(uris)
  //console.dir(paths)

  test.assert(paths.length === 1, paths.length)
  test.assert(paths[0].length === 2, paths[0].length)
  test.assert(paths[0][0] === 'http://example.com/p', paths[0][0])
  test.assert(paths[0][1].length === 3, paths[0][1].length)
  test.assert(paths[0][1][0] === 'a.js', paths[0][1][0])
  test.assert(paths[0][1][1] === 'c/d.js', paths[0][1][1])
  test.assert(paths[0][1][2] === 'c/e.js', paths[0][1][2])


  // map = [
  //   ['http://example.com/p/a.js': 'http://example.com/p/??a.js,c/d.js,c/e.js'],
  //   ['http://example.com/p/c/d.js': 'http://example.com/p/??a.js,c/d.js,c/e.js']
  //   ['http://example.com/p/c/e.js': 'http://example.com/p/??a.js,c/d.js,c/e.js']
  // ]
  var map = util.toComboMap(paths)
  //console.dir(map)

  test.assert(map.length === 3, map.length)
  test.assert(map[0].length === 2, map[0].length)
  test.assert(map[1].length === 2, map[1].length)
  test.assert(map[1].length === 2, map[2].length)
  test.assert(map[0][0] === 'http://example.com/p/a.js', map[0][0])
  test.assert(map[1][0] === 'http://example.com/p/c/d.js', map[1][0])
  test.assert(map[2][0] === 'http://example.com/p/c/e.js', map[2][0])
  test.assert(map[0][1] === 'http://example.com/p/??a.js,c/d.js,c/e.js', map[0][1])
  test.assert(map[1][1] === map[0][1], map[1][1])
  test.assert(map[2][1] === map[0][1], map[2][1])


  var count = 0

  // test seajs.use
  seajs.config({ comboSyntax: ['', '+'] }).use(['./a', './b'], function(a, b) {
    test.assert(a.name === 'a', a.name)
    test.assert(b.name === 'b', b.name)
    done()
  })

  // test require.async and deps
  require.async(['./c', './f'], function(c, f) {
    test.assert(c.d.name === 'd', c.d.name)
    test.assert(c.e.name === 'e', c.e.name)
    test.assert(f.name === 'f', f.name)
    done()
  })


  function done() {
    count++
    if (count === 2) {
      test.done()
    }
  }

})
