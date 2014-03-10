define(function(require, exports) {

  exports.name = 'a'

  exports.getB = function () {
    return b
  }

  var b = require('./b')

});

