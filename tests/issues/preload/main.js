

var preloadTest1 = this.PreloadTest1;


define(function(require) {
  var test = require('../../test');

  test.assert([].map, 'preload es5-safe');
  test.assert(this.JSON, 'preload json2');

  test.assert(preloadTest1 === 1, 'preload before onload');
  test.assert(this.PreloadTest1 === 1, 'preload before provide');

  test.done();
});
