
define(function(require) {

  var test = require('../../test');

  require('./extend');
  var Developer = require('./developer');

  var dev = new Developer();

  console.dir(dev);

  test.done();
});
