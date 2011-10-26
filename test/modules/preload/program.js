
seajs.config({
  preload: ['./modules/preload/a']
});


define(function(require) {
  var test = require('../../test');

  test.assert(this.A === 'a', 'preload is ok');
  test.assert(require('./b').name === 'b', 'b.js is ok');

  test.done();
});
