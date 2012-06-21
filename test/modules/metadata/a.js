define(function(require, exports, m) {

  var test = require('../../test');

  test.assert(m.id === undefined, 'module.id = ' + m.id);
  test.assert(m.exports === exports, 'check module.exports');
  test.assert(m.parent, 'module.parent = ' + m.parent.uri);

  test.assert(typeof(require.async) === 'function', 'check require.async');
  test.assert(typeof(require.cache) === 'object', 'check require.cache');
  test.assert(typeof(require.resolve) === 'function', 'check require.resolve');


  // not in node environment
  if (typeof process === 'undefined') {
    test.assert(typeof(m.dependencies) === 'object', 'module.dependencies = ' + m.dependencies);
    test.assert(m.factory, 'module.factory = ' + typeof m.factory);
    test.assert(m.uri, 'module.uri = ' + m.uri);
    test.assert(m.status, 'module.status = ' + m.status);

    var i = 0;
    for (var k in m) {
      if (m.hasOwnProperty(k)) {
        i++;
      }
    }

    test.assert(i === 7, 'module has 7 members');
  }

});
