define(function(require, exports, module) {

  var test = require('../../test');


  // require('./a')


  //
  //     var Calendar = require('./d');


  /**
   * require('./b')
   */

  require('./c');

  this.require = function() { };
  this.require('./404');


  test.assert(this.a === undefined, 'remove require ./a')
  test.assert(this.b === undefined, 'remove require ./b')
  test.assert(this.c === 'c', 'c.js is loaded successfully. this.c = ' + this.c)
  test.assert(this.d === undefined, 'remove require ./d')
  test.assert(module.dependencies.length === 2, module.dependencies)

  test.done()

});