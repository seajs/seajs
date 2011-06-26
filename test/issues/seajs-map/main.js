define(function(require) {

  var test = require('../../test');

  var a = require('./a');
  var b = require('./b');

  test.assert(a.name === 'a', 'a is ok');
  test.assert(b.name === 'b', 'b is ok');
  test.done();

});
