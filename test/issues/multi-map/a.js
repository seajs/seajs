define(function(require, exports, module) {

  var test = require('../../test');

  test.assert(/t=123$/.test(module.id), module.id);
  exports.name = 'a';
});
