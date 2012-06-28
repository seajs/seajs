define(function(require) {

  var test = require('../../test')
  var $ = require('$')


  $(function() {

    var passed = false
    var type = 'error'

    var onreadyTime = new Date().getTime()

    // no image cache
    if (onloadTime === 0) {
      passed = true
      type = 'no image cache'
    }
    // image cache case
    else if (Math.abs(onreadyTime - onloadTime) < 2000) {
      passed = true
      type = 'has image cache'
    }

    test.assert(passed, type + ' diff = ' + Math.abs(onreadyTime - onloadTime))
    test.done()

  })

})
