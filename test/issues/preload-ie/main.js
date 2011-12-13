
seajs.config({
  preload: ['plugin-text']
});


define(function(require) {

  var test = require('../../test');
  var tpl = require('./a.tpl');

  test.assert(tpl === 'I am a template file. "\'', tpl);
  test.done();
});
