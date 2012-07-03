define(function(require) {

  var test = require('../../test')

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

  test.assert(true, 'Multi use of css files is ok')
  test.done()

})
