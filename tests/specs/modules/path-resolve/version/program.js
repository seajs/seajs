define(function (require) {

  var a = require('./a.js?v=1.0');
  var a2 = require('./a.js?v=2.0');

  var test = require('../../test');
  test.assert(a.foo === 1, a.foo);
  test.assert(a.foo === a2.foo, a2.foo);

  test.done();

});
