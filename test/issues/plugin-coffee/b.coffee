define (require, exports) ->
  exports.name = 'b'
  exports.a = require('./a.coffee')
  return
