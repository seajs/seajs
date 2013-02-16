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


  function done() {
    if (++count === 3) {
      test.next()
    }
  }

});

