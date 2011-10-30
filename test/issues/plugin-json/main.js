define(function(require) {

  var test = require('../../test');
  var json = require('./b.json');

  test.assert(json.name === 'b', json.name);
  test.assert(json.foo === "'bar'\"", json.foo);

  test.done();
});
