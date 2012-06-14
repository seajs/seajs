define(["../../test", "", null, undefined], function(require, exports, module) {

  var test = require('../../test');

  test.assert(module.dependencies.length === 1, 'remove invalid deps');
  test.done();

});
