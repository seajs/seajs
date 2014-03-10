define('z', ['z1', 'z2'], function(require, exports) {
  require('z1')
  require('z2')

  exports.name = 'z'
})