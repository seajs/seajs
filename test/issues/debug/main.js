
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

  test.assert(a.id.indexOf(timestamp) > 0, 'a is ok');
  test.assert(b.id.indexOf(timestamp) > 0, 'b is ok');
  test.assert(c.id.indexOf(timestamp) > 0, 'c is ok');
  test.assert(d.id.indexOf(timestamp) > 0, 'd is ok');

  test.done();
});
