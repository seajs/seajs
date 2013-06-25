define('a', [], function(require, exports) {

  require.async('a1')
  require.async(['a2', 'a3'])

  exports.name = 'a'

})
