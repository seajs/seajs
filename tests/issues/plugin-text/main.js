define(function(require) {

  var test = require('../../test');

  var a = require('./a.tpl');
  var b = require('./b.tpl');
  var c = require('./c.tpl');
  var html = require('./c.html');

  test.assert(a === 'I am a template file. "\'', 'a is ok');
  test.assert(b.length === 0, 'b is ok');
  test.assert(c.indexOf('</div>') > 0, 'c is ok');
  test.assert(html.indexOf('I am a html file') > 0, 'html is ok');

  test.done();
});
