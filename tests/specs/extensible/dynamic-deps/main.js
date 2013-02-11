
seajs.on('initialized', function(mod) {
  if (mod.uri.indexOf('jquery-plugin.js') > 0) {
    mod.dependencies.push('./jquery')
  }
})

define(function(require) {

  var test = require('../../../test')
  require('./jquery-plugin')

  test.assert(this.jQuery, 'global jQuery')
  test.assert(this.jQuery.pluginXX.name === 'xx', 'jQuery plugin')

  this.jQuery = undefined
  test.next()

})

