seajs.config({
  alias: {
    'jquery': '1.7.2'
  }
})

define(function(require) {

  var $ = require('jquery')

  require('./spinning').spinning($('#container img'))

})
