define('deep', ['deep1', 'deep2'], function(require, exports) {
  require('deep1')
  exports.name = 'deep'
})
