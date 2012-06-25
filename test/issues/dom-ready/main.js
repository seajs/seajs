var MODULES_PATH = 'http://modules.seajs.org/'
var isLocal = location.href.indexOf('/~lifesinger/') > 0

if (isLocal) {
  MODULES_PATH = 'http://' + location.host + '/~lifesinger/seajs/spm/modules/'
}

seajs.config({
  base: MODULES_PATH,

  alias: {
    'jquery': '1.7.2'
  }
});


define(function(require) {

  var test = require('../../test')
  var $ = require('jquery')

  $(document).ready(function() {

    var passed = false
    var type = 'error'

    var onreadyTime = new Date().getTime()

    // no image cache
    if (onloadTime === 0) {
      passed = true
      type = 'no image cache'
    }
    // image cache case
    else if (Math.abs(onreadyTime - onloadTime) < 2000) {
      passed = true
      type = 'has image cache'
    }

    test.assert(passed, type + ' diff = ' + Math.abs(onreadyTime - onloadTime))
    test.done()

  })

})
