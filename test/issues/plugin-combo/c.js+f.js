define('./c', ['./d', './e'], function(require, exports) {

  exports.d = require('./d')
  exports.e = require('./e')

})

define('./f', { name: 'f' })
