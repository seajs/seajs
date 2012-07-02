define('hello', ['jquery'], function(require, exports) {

  var $ = require('jquery')

  exports.sayHello = function() {
    $('#hello').toggle('slow')
  }

})
