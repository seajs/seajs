
define(function(require) {

  var test = require('../../test');


  // require('./a')

  /**
   * require('./b')
   */

  require('./c');

  this.require = function() { };
  this.require('./404');


  test.assert(this.a === undefined, 'remove require ./a');
  test.assert(this.b === undefined, 'remove require ./b');
  test.assert(this.c === 'c', 'c.js is loaded successfully');

  test.done();

});
