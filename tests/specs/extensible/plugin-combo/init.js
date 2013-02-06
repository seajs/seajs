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


  // hash:
  //   'http://example.com/p/a.js' ==> 'http://example.com/p/??a.js,c/d.js,c/e.js'
  //   'http://example.com/p/c/d.js' ==>'http://example.com/p/??a.js,c/d.js,c/e.js'
  //   'http://example.com/p/c/e.js' ==> 'http://example.com/p/??a.js,c/d.js,c/e.js'
  //
  util.toComboHash(paths)
  var hash = util.comboHash
  console.dir(hash)

  var comboPath = 'http://example.com/p/??a.js,c/d.js,c/e.js'
  test.assert(hash['http://example.com/p/a.js'] === comboPath, hash['http://example.com/p/a.js'])
  test.assert(hash['http://example.com/p/c/d.js'] === comboPath, hash['http://example.com/p/c/d.js'])
  test.assert(hash['http://example.com/p/c/e.js'] === comboPath, hash['http://example.com/p/c/e.js'])


  // test seajs.use
  seajs.config({
    comboSyntax: ['', '+'],
    comboExcludes: /x\.js/
  })

  seajs.use(['./a', './b', './x'], function(a, b, x) {
    test.assert(a.name === 'a', a.name)
    test.assert(b.name === 'b', b.name)
    test.assert(x.name === 'x', x.name)

    // test require.async and deps
    require.async(['./c', './f'], function(c, f) {
      test.assert(c.d.name === 'd', c.d.name)
      test.assert(c.e.name === 'e', c.e.name)

      // already loaded modules
      test.assert(c.a.name === 'a', c.a.name)
      test.assert(c.b.name === 'b', c.b.name)

      test.assert(f.name === 'f', f.name)

      done()
    })

    // remove already fetching or fetched modules
    require.async(['./l', './m', './c', './f', './a', './a.css'], function(l, m, c, f, a) {
      test.assert(l.name === 'l', l.name)
      test.assert(m.name === 'm', m.name)
      test.assert(f.name === 'f', f.name)
      test.assert(a.name === 'a', a.name)

      done()
    })

    var count = 0

    function done() {
      if (++count === 2) test.done()
    }

  })

})
