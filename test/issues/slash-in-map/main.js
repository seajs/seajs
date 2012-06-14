define(function(require) {

  var test = require('../../test');
  var a = require('./a/a');

  test.assert(a.name === 'b/a', a.name);
  test.done();

});
