

seajs.config({
  preload: './test2'
});

define(function(require) {
  var test = require('../../test');

  test.assert([].map, 'preload es5-safe');
  test.assert(this.JSON, 'preload json2');

  test.assert(this.PreloadTest1 === 1, 'preload test1.js');
  test.assert(this.PreloadTest2 === 2, 'preload test2.js');

  test.done();
});
