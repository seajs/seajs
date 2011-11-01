

seajs.config({
  preload: './test2'
});

var preloadTest1 = this.PreloadTest1;


define(function(require) {
  var test = require('../../test');

  test.assert([].map, 'preload es5-safe');
  test.assert(this.JSON, 'preload json2');

  test.assert(preloadTest1 === 1, 'preload before load');
  test.assert(this.PreloadTest1 === 1, 'preload before provide');
  test.assert(this.PreloadTest2 === 2, 'preload test2.js');

  test.done();
});
