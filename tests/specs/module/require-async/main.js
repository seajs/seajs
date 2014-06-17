define(function(require) {

  var test = require('../../../test')
  var count = 0


  require.async('./a', function(a) {
    test.assert(a.name === 'a', 'load CMD module file')
    done()
  })

  require.async('./b.js', function() {
    test.assert(global.SPECS_MODULES_ASYNC === true, 'load normal script file')
    global.SPECS_MODULES_ASYNC = undefined
    done()
  })

  require.async(['./c1', './c2'], function(c1, c2) {
    test.assert(c1.name === 'c1', c1.name)
    test.assert(c2.name === 'c2', c2.name)
    done()
  })

  // Duplicate modules
  require.async(['./a', './c1', './a', '', ''], function(a, c1, a2, e1, e2) {
    test.assert(a.name === 'a', a.name)
    test.assert(c1.name === 'c1', c1.name)
    test.assert(a2.name === 'a', a2.name)
    test.assert(e1 === void 0, 'null')
    test.assert(e2 === void 0, 'null')
    done()
  })

  function done() {
    if (++count === 4) {
      test.next()
    }
  }

});

