
seajs.config({
  base: './duplicate-load/'
})


define(function(require) {

  var test = require('../../../test')

  var combo = require('./a+b')
  test.assert(combo === null, 'only return exports when url is matched strictly')

  require.async('./a', function(a) {
    test.assert(a.name === 'a', 'do NOT load a.js')
    test.next()
  })

});

