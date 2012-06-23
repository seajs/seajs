
seajs.config({
      map: [
        ['a.js', 'b.js']
        ,[/(b\.js)/i, 'sub/$1']
      ]
    });

define(function(require) {

  var test = require('../../test');
  var a = require('./a');

  test.assert(a.name === 'b', 'The result of a.name is b');
  test.done();

});
