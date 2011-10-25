
seajs.config({
  preload: ['plugin-coffee']
});


define(function(require) {
  var test = require('../../test');
  var a = require('./a.coffee');

  test.assert(a.name === 'a', 'coffee script is ok');
  test.done();
});
