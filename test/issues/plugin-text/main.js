define(function(require) {

  var test = require('../../test');

  var tpl = require('./a.tpl');
  var html = require('./c.html');

  test.assert(tpl === 'I am a template file. "\'', tpl);
  test.assert(~html.indexOf('I am a html file.'), 'html is ok');

  test.done();
});
