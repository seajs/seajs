define(function(require) {

  var test = require('../../test');

  require.async('./a', function(a) {
    test.assert(a.foo === 'a', 'test require.async from factory.');
  });

  require.async('./b');

  require.async('./c.js', function() { // load normal script file.
    test.done();
  });

});
