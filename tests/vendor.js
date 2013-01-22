
(function() {

  var baseUri = seajs.pluginSDK.config.base
  var GALLERY_ROOT = 'https://a.alipayobjects.com/gallery/'

  // Ref: https://github.com/miohtama/detectmobile.js
  var isMobile = Math.max(screen.availWidth || screen.availHeight) <= 480


  var hash = {
    '$': isMobile ? 'gallery/zepto/1.0.0/zepto' : 'gallery/jquery/1.7.2/jquery',
    'coffee': 'gallery/coffee/1.4.0/coffee-script',
    'less': 'gallery/less/1.3.1/less'
  }

  seajs.config({
    alias: hash,
    map: [
        [baseUri + 'gallery/', GALLERY_ROOT]
    ]
  })


  define({
    isMobile: isMobile
  })

})()
