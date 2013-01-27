define(function(require, exports) {

  exports.add = function() {
    var sum = 0, i = 0, l = arguments.length

    while(i < l) {
      sum += arguments[i++]
    }

    return sum
  }

});

