define(function(require) {

  var test = require('../../test');
  var a = require('./a.coffee');

  test.assert(a.name === 'a', 'a.coffee is ok');
  test.done();

});
