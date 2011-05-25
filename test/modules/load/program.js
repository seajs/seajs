define(function(require, exports, module) {

  var test = require('../../test');

  module
      .load('./a', function(a) {
          test.assert(a.foo === 'a', 'test module.load from factory.');
        })
      .load('./b')
      .load('./c.js', function() { // load normal script file.
        test.done();
      });
});
