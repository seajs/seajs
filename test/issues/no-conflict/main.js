define(function(require) {

  var test = require('../../test');

  test.assert(true, 'It works!');
  test.assert(seajs.version === '1.0.0', seajs.version);

  test.done();

});
