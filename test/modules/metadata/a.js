define(function(require, exports, m) {

  var test = require('../../test');

  test.assert(typeof(m.dependencies) === 'object', 'module.dependencies = ' + m.dependencies);
  test.assert(m.exports === exports, 'check module.exports');
  test.assert(m.uri, 'module.uri = ' + m.uri);
  test.assert(typeof(m.load) === 'function', 'check module.load');

  var i = 0;
  for (var k in m) {
    i++;
  }
  test.assert(i === 4, 'module has only 4 members');

});
