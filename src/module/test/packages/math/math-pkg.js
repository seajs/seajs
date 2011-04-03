

module.declare('increment', ['./math'], function(require, exports) {

  var add = require('./math').add;

  exports.increment = function(val) {
    return add(val, 1);
  }

});


module.declare('math', [], function(require, exports) {

  exports.add = function() {
    var sum = 0, i = 0, l = arguments.length;
    while(i < l) {
      sum += arguments[i++];
    }
    return sum;
  }

});
