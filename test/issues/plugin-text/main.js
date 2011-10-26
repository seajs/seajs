define(function(require) {

  var test = require('../../test');

  var tpl = require('./a.tpl');
  var json = globalEval('(' + require('./b.json') + ')');
  var html = require('./c.html');

  test.assert(tpl === 'I am a template file. "\'', tpl);
  test.assert(json.name === 'b', json.name);
  test.assert(json.foo === "'bar'\"", json.foo);
  test.assert(~html.indexOf('I am a html file.'), 'html is ok');
  test.done();


  function globalEval(data) {
    if (data && /\S/.test(data)) {
      return ( window.execScript || function(data) {
        return window['eval'].call(window, data);
      } )(data);
    }
  }

});
