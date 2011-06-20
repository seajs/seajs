define(function(require) {

  var test = require('../../test');

  require('./extend');
  var a = require('./a');

  test.assert(a.filename === 'a.js', 'The result of a.filename is a.js.');
  test.done();

});
