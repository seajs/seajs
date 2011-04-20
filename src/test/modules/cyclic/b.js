define(function (require, exports) {

  var a = require('./a');

  exports.b = function () {
    return a;
  };

});
