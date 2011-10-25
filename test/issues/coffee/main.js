define(function(require) {

  var test = require('../../test');

  var a = require('./a.coffee');
  var b = require('./b.coffee');

  test.assert(a.name === 'a', a.name);
  test.assert(b.name === 'b', b.name);
  test.assert(b.a === a, b.a.name);

  test.done();
});
