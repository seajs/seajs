
seajs.config({
      map: [
        ['a.js', 'sub/b.js']
      ]
    });

define(function(require) {

  var test = require('../../test');
  var a = require('./a');

  test.assert(a.name === 'b', 'The result of a.name is b');
  test.done();

});
