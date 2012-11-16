define("circular-deps/a-debug", ["./b-debug", "./c-debug"], function(require, exports) {
  require('./b-debug')

  exports.name = 'a'
})

define("circular-deps/b-debug", ["./c-debug"], function(require, exports) {
  require('./c-debug')

  exports.name = 'b'
})

define("circular-deps/c-debug", ["./b-debug"], function(require, exports) {
  require('./b-debug')

  exports.name = 'c'
})

define("circular-deps/main-debug", ["./a-debug", "./b-debug", "./c-debug", "test-debug"], function(require) {

  var test = require('test-debug')
  var a = require('./a-debug')

  test.assert(a.name === 'a', a.name)
  test.done()

})
