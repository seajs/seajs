
global.module_singleton_stack = []

define(function(require) {
  var test = require('../../../test')
  var count = 0

  seajs.use('./singleton/a', function() {
    module_singleton_stack.push('use a')
    done()
  })

  seajs.use('./singleton/b', function() {
    module_singleton_stack.push('use b')
    done()
  })

  function done() {
    if (++count === 2) {

      for (var i = 0; i < module_singleton_stack.length; i++) {
        test.assert(true, module_singleton_stack[i])
      }

      test.assert(module_singleton_stack.length === 4, module_singleton_stack.length)

      global.module_singleton_stack = undefined
      test.next()

    }
  }

})

