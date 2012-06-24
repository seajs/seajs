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

    test.assert(onLoaded === false, onLoaded)
    test.done()

  })

})
