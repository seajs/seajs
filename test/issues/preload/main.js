
define(function(require) {

  var test = require('../../test');

  test.assert([].map, 'preload es5-safe');
  test.assert(this.JSON, 'preload json2');

  test.done();

});
