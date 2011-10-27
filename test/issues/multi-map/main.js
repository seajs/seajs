
seajs.config({
  map: [
      [ /^(.*)$/, '$13', -1 ]
      [ /^(.*)$/, '$1?t=1' ]
      ,[ /^(.*)$/, '$12' ]
  ]
});

define(function(require) {

  var test = require('../../test');
  var a = require('./a');

  test.assert(a.name === 'a', a.name);
  test.done();

});
