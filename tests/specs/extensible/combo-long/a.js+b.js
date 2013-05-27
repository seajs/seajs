define('a', ['g'], function(require, exports) {
  exports.name = 'a'
  exports.g = require('g')
})

define('b', ['h'], function(require, exports) {
  exports.name = 'b'
  exports.h = require('h')
})
