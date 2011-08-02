
seajs.config({
  'alias': {
    'c': 'c.js?20110801'
  },
  'map': [
      [ /^(.*\/issues\/timestamp\/.*\.(?:css|js))(?:.*)$/i, '$1?20110802' ]
  ]
});


define(function(require) {

  var test = require('../../test');

  var a = require('./a.js?20110801');
  var b = require('./b.js?20110801');
  var c = require('./c.js');
  var d = require('./d');

  test.assert(a.name === 'a', 'a is ok');
  test.assert(b.name === 'b', 'b is ok');
  test.assert(c.name === 'c', 'c is ok');
  test.assert(d.name === 'd', 'd is ok');

  test.done();
});
