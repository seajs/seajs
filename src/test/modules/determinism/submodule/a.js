define(function(require) {

  var test = require('test/test');

  test.assert(require('a') === null, 'require() does not fall back to relative modules when absolutes are not available.')

});
