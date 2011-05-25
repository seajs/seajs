define(function(require) {

  var test = require('../../test');

  var a = require('./a');
  var b = require('./b');
  var c = require('./c');

  test.assert(a.a === 'a', 'a is ok');
  test.assert(b.b === 'b', 'b is ok');
  test.assert(c.c === 'c', 'c is ok');

  test.done();

});
