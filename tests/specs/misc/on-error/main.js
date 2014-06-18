define(function(require) {

  var test = require('../../../test')
  var n = 0


  // 404
  var a
  try {
    a = require('./a')
  } catch (e) {
    test.assert(e.toString().indexOf('module was broken:') > -1, '404 error msg ' + e)
    n++
  }
  test.assert(a === void 0, '404 a')

  // exec error
  setTimeout(function() {
    var b = require('./b')
  }, 0)


  require.async('./c', function(c) {
    test.assert(c === void 0, '404 c')
    done()
  })

  require.async('./e', function(e) {
    test.assert(e === void 0, 'exec error e')
    done()
  })

  seajs.use('./d', function(d) {
    test.assert(d === void 0, '404 d')
    done()
  })

  // 404 css
  //require('./f.css')

  function done() {
    if (++n === 4) {
      test.assert(w_errors.length > 0, w_errors.length)

      // 0 for IE6-8
      test.assert(s_errors.length === 0 || s_errors.length === 3, s_errors.length)
      test.next()
    }
  }

})

