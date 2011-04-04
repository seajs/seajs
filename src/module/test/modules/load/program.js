module.declare(function(require, exports, module) {

  var test = require('test/test');

  module.load('./a', function(a) {

    test.assert(a.foo === 'a', 'test module.load from factory.');
    test.print('DONE', 'info');

  });

});
