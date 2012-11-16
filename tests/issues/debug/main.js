
var debugInitialValue = seajs.debug;


seajs.config({
  debug: 2
});


define(function(require) {

  var test = require('../../test');

  var a = require('./a');
  var b = require('./b');
  var c = require('./c');
  var d = require('./d');

  var timestamp = (new Date().getTime() + '').substring(0, 8);

  test.assert(debugInitialValue === undefined, 'initial debug value is undefined');
  test.assert(seajs.debug === true, 'seajs.debug should be true');
  test.assert(a.uri.indexOf(timestamp) === -1, a.uri);
  test.assert(b.uri.indexOf(timestamp) === -1, b.uri);
  test.assert(c.uri.indexOf(timestamp) === -1, c.uri);
  test.assert(d.uri.indexOf(timestamp) === -1, d.uri);


  var scripts = document.getElementsByTagName('script');
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    if (src && /\/debug\/\w\.js/.test(src)) {
      test.assert(src.indexOf(timestamp) > 0, src);
    }
  }

  test.done();
});
