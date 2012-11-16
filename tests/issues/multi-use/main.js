
//console.log('main.js is loaded');

define(function(require, exports) {

  //console.log('main.js is required');

  var test = require('../../test');

  exports.echo = function(n) {
    test.assert(true, 'It works! ' + n);
  };

  exports.done = function() {
    test.done();
  };

  exports.echo(0);

});
