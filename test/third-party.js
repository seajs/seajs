;
(function() {

  var SEAJS_PATH = seajs.pluginSDK.config.base
  var MODULES_PATH = 'https://a.alipayobjects.com/static/arale/'

  if (location.href.indexOf('/~lifesinger/') > 0) {
    MODULES_PATH = 'http://' + location.host + '/~lifesinger/seajs/spm/modules/'
  }


  var hash = {
    'jquery/1.7.2/jquery.js': 'jQuery',
    'coffee/1.3.3/coffee-script.js': 'CoffeeScript',
    'less/1.3.0/less.js': 'LESS'
  }


  seajs.config({
    map: [
      function(url) {
        if (hash[url.substring(SEAJS_PATH.length)]) {
          return url.replace(SEAJS_PATH, MODULES_PATH)
        }
        return url
      }
    ]
  })


  var deps = []
  var names = []

  for (var key in hash) {
    if (hash.hasOwnProperty(key)) {
      deps.push(key)
      names.push(hash[key])
    }
  }

  define(deps, function(require, exports) {

    for (var i = 0; i < names.length; i++) {
      exports[names[i]] = require(deps[i])
    }

  })

})()
