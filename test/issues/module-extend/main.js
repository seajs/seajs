
define(function(require) {

  var test = require('../../test');

  require('./extend');
  var Developer = require('./developer');
  var Stuff = require('./stuff');

  var dev = new Developer();
  var stuff = new Stuff();

  test.assert(dev.constructor.file.indexOf('developer.js') > 0, 'test constructor.file');
  test.assert(stuff.constructor.file.indexOf('stuff.js') > 0, 'test constructor.file');

  test.done();
});
