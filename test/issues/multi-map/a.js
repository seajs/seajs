define(function(require, exports, module) {

  var test = require('../../test');

  test.assert(/\?1\?2\?3$/.test(module.id), module.id);
  exports.name = 'a';

});
