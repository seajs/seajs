define(function(require) {

  var test = require('../../test');
  var hasOwnProperty = require('./hasOwnProperty');

  try {
    var toString = require('./toString');
  }
  catch(ex) { // for node
    toString = null;
  }

  test.assert(toString === null, 'should return null when module does not exist.');
  test.done();

});
