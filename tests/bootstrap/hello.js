define(function(require, exports) {

  var test = require('../test');
  var p = this.parent;

  exports.sayHello = function() {
    test.assert(true, document.title + ': It works!');

    try {
      p['testCount']++;

      if (self.N) { self.N--; }
      if (!self.N) p['next']();

    }
    catch(ex) {
    }
  };

});
