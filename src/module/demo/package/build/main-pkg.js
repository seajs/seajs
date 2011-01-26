module.declare('main', ['./biz/increment'], function(require) {

  var inc = require('./biz/increment').increment;
  document.body.innerHTML = 'inc(1) = ' + inc(1);

});

module
    .prefix('sci', '../lib/science')
    .declare('biz/increment', ['sci/math'], function(require, exports, module) {

  var add = require('sci/math').add;

  exports.increment = function(val) {
    return add(val, 1);
  }

});

module.declare('lib/science/math', [], function(require, exports, module) {

  exports.add = function() {
    var sum = 0, i = 0, l = arguments.length;
    while(i < l) {
      sum += arguments[i++];
    }
    return sum;
  }

});
