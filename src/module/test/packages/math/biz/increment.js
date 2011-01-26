module
    .prefix('sci', '../lib/science')
    .declare('biz/increment', ['sci/math'], function(require, exports, module) {

  var add = require('sci/math').add;

  exports.increment = function(val) {
    return add(val, 1);
  }

});
