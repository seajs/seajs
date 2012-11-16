
seajs.config({
  debug: 1,
  map: [
    [ /^(.*)$/, '$1?1' ],
    [ /^(.*)$/, '$1?2' ],
    [ /^(.*)$/, '$1?3']
  ]
});

define(function(require) {

  var test = require('../../test');
  var a = require('./a');

  test.assert(a.name === 'a', a.name);
  test.done();

});
