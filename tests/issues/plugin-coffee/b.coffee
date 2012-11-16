define (require, exports) ->
  exports.name = 'b'
  exports.a = require('./a2.coffee')
  return
