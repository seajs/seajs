define(function(require) {

  var test = require('../../test');
  var hasOwnProperty = require('./hasOwnProperty');
  var toString = require('./toString');

  test.assert(hasOwnProperty.name === 'hasOwnProperty', hasOwnProperty.name);
  test.assert(toString.name === 'toString', toString.name);

  test.done();
});
