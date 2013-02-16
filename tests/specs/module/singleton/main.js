
seajs.config({
  base: './singleton'
})

global.module_singleton_stack = []


define(function(require) {

  seajs.use('a', function() {
    module_singleton_stack.push('use a')
    done()
  })

  seajs.use('b', function() {
    module_singleton_stack.push('use b')
    done()
  })


  var test = require('../../../test')
  var count = 0

  function done() {
    if (++count === 2) {

      for (var i = 0; i < module_singleton_stack.length; i++) {
        test.assert(true, module_singleton_stack[i])
      }

      test.assert(module_singleton_stack.length === 4, module_singleton_stack.length)

      this.module_singleton_stack = undefined
      test.next()

    }
  }

});

