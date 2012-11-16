define(function(require) {

  seajs.use('./a', function() {
    stack.push('use a')
    done()
  })

  seajs.use('./b', function() {
    stack.push('use b')
    done()
  })


  var test = require('../../test')
  var count = 0

  function done() {
    if (++count === 2) {
      for (var i = 0; i < stack.length; i++) {
        test.print(stack[i])
      }

      test.assert(stack.length === 4, stack.length)
      test.done()
    }
  }

})
