
seajs.config({
  map: [
      function(url) {
        var base = seajs.pluginSDK.config.base
        var online = 'https://a.alipayobjects.com/static/arale/'
        var jq = 'jquery/1.7.2/jquery.js'

        if (url === base + jq) {
          return online + jq
        }

        return url
      }
  ]
})

define(function(require, exports) {

  exports.jQuery = require('jquery/1.7.2/jquery')

})
