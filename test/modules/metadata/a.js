define(function(require, exports, m) {

  var test = require('../../test');

  test.assert(typeof(m.dependencies) === 'object', 'module.dependencies = ' + m.dependencies);
  test.assert(m.exports === exports, 'check module.exports');
  test.assert(m.id, 'module.id = ' + m.id);
  test.assert(typeof(require.async) === 'function', 'check require.async');

  var i = 0;
  for (var k in m) {
    i++;
  }
  test.assert(i === 3, 'module has only 3 members');

});
