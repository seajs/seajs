define(function (require, exports) {

  exports.name = 'b'

  var a = require('./a')

  exports.getA = function () {
    return a
  }

});

