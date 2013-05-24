define(function(require) {

  var test = require('../../../test')
  var n = 0


  // 404
  var a = require('./a')
  test.assert(a === null, '404 a')

  // exec error
  setTimeout(function() {
    var b = require('./b')
  }, 0)


  require.async('./c', function(c) {
    test.assert(c === null, '404 c')
    done()
  })

  require.async('./e', function(e) {
    test.assert(e === null, 'exec error e')
    done()
  })

  seajs.use('./d', function(d) {
    test.assert(d === null, '404 d')
    done()
  })

  // 404 css
  //require('./f.css')

  function done() {
    if (++n === 3) {
      test.assert(w_errors.length > 0, w_errors.length)
      test.assert(s_errors.length === 4, s_errors.length)
      test.next()
    }
  }

})

