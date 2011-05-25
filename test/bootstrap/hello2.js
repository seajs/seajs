define(function(require, exports) {

  var test = require('../test');
  var p = this.parent;

  exports.sayHello = function() {
    p['testCount']++;
    test.assert(true, document.title + ': It works! 2');
  };

});
