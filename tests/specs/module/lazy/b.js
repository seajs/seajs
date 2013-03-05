define(function(require, exports) {

  exports.name = 'b'

  var a = require('./a')
  a.count++

})

