module.declare(function(require, exports) {

  exports.a = function () {
    return b;
  };

  var b = require('./b');

});
