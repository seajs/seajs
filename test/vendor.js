
;(function() {

  var MODULES_PATH = 'https://a.alipayobjects.com/static/arale/'
  //var MODULES_PATH = 'http://modules.seajs.org/'

  if (location.href.indexOf('/~lifesinger/x') > 0) {
    MODULES_PATH = 'http://' + location.host + '/~lifesinger/seajs/spm/modules/'
  }


  // Ref: https://github.com/miohtama/detectmobile.js
  var isMobile = Math.max(screen.availWidth || screen.availHeight) <= 480


  function root(path) {
    return MODULES_PATH + path
  }


  var hash = {
    '$': root(isMobile ? 'zepto/0.8.0/zepto.js' : 'jquery/1.7.2/jquery.js'),
    'coffee': root('coffee/1.3.3/coffee-script.js'),
    'less': root('less/1.3.0/less.js')
  }

  seajs.config({
    alias: hash
  })


  define({ isMobile: isMobile })

})()
