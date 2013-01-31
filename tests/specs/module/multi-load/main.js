define(function(require) {

  var test = require('../../../test')

  require.async('./a.css')
  require.async('./a.css')
  require.async('./a.css')
  require.async('./a.css')
  require.async('./a.css')
  require.async('./a.css')

  require.async('./a.js')
  require.async('./a.js')
  require.async('./a.js')
  require.async('./a.js')
  require.async('./a.js')
  require.async('./a.js')

  test.assert(true, 'load the same css file multi times is ok')
  test.next()

})
