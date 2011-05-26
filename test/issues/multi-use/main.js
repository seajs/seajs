define(function(require, exports) {

  var test = require('../../test');

  exports.echo = function(n) {
    test.assert(true, 'It works! ' + n);
  };

  exports.done = function() {
    test.done();
  };

  exports.echo(0);

});
