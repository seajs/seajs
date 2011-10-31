define(function(require) {

  var test = require('../../test');
  var b = require('./b.json');
  var c = require('./c.json?t=30222');

  test.assert(b.name === 'b', b.name);
  test.assert(b.foo === "'bar'\"", b.foo);
  test.assert(c.name === 'c', c.name);
  test.assert(typeof c.n === 'number', typeof c.n);

  test.done();
});
