define(function(require) {

  var test = require('../../test')

  document.getElementById('test').onclick = function() {
    require.async(['./a.js', './a.css', './x.js'], function(A) {
      A.click()
    })
  }

  test.assert(true, 'Please test me manually')
  test.done()

})
