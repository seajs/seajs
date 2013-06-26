define('deep1', ['deep2'], function(require, exports) {
  require('deep2')
  exports.name = 'deep1'
})
