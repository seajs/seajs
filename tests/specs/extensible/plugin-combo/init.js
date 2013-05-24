define(function(require) {

  var test = require('../../../test')
  var util = seajs.test
  var count = 0

  var uris = [
    'http://example.com/p/a.js',
    'https://example2.com/b.js',
    'http://example.com/p/c/d.js',
    'http://example.com/p/c/e.js'
  ]

  // paths = [
  //           [ 'http://example.com/p', ['a.js', 'c/d.js', 'c/e.js'] ]
  //         ]
  var paths = util.uris2paths(uris)
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
  var hash = util.paths2hash(paths)
  //console.dir(hash)

  var comboPath = 'http://example.com/p/??a.js,c/d.js,c/e.js'
  test.assert(hash['http://example.com/p/a.js'] === comboPath, hash['http://example.com/p/a.js'])
  test.assert(hash['http://example.com/p/c/d.js'] === comboPath, hash['http://example.com/p/c/d.js'])
  test.assert(hash['http://example.com/p/c/e.js'] === comboPath, hash['http://example.com/p/c/e.js'])


  // Test seajs.use
  seajs.config({
    comboSyntax: ['', '+'],
    comboExcludes: /x\.js/
  })

  seajs.use(['a', 'b', 'x'], function(a, b, x) {
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

    // Remove already fetching or fetched modules
    var arr = ['./l', './m', './c', './f', './a']
    if (typeof process === 'undefined') arr.push('./a.css')

    require.async(arr, function(l, m, c, f, a) {
      test.assert(l.name === 'l', l.name)
      test.assert(m.name === 'm', m.name)
      test.assert(f.name === 'f', f.name)
      test.assert(a.name === 'a', a.name)

      done()
    })

    // Max length limit
    seajs.config({
      comboMaxLength: (seajs.config.data.base + 'long/1.js+2.js+3.js').length
    })

    // long/1.js+2.js+3.js
    // long/4.js+5.js+6.js
    require.async(['long/1', 'long/2', 'long/3', 'long/4', 'long/5', 'long/6'],
        function(l1, l2, l3, l4, l5, l6) {

          test.assert(l1.name === '1', l1.name)
          test.assert(l2.name === '2', l2.name)
          test.assert(l3.name === '3', l3.name)
          test.assert(l4.name === '4', l4.name)
          test.assert(l5.name === '5', l5.name)
          test.assert(l6.name === '6', l6.name)

          done()
        })

    function done() {
      if (++count === 3) test.next()
    }

  })

});

