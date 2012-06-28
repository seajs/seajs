define(function(require) {

  var test = require('../../test');

  test.assert(require('./a2').foo === 'bar', 'augmentPackageHostDeps can be removed');
  test.assert(require('./a3').foo === 'bar2', 'augmentPackageHostDeps can be removed');
  test.done();

});
