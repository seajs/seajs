define(function(require) {

  var test = require('../../test');
  var $ = require('../../third-party').jQuery;

  require('./red.css');
  test.assert($('#red').width() === 200, '#red width should be 200');

  test.assert($('#blue').width() !== 200, '#blue width should not be 200. The actual value is ' + $('#blue').width());
  require.async('./blue.css', function() {
    setTimeout(function() {
      test.assert($('#blue').width() === 200, '#blue width should be 200 now');
    }, 500);
  });

  require.async('./notExisted.css', function() {
    test.print('404!');
  });
  //test.print('** 404 will occur after 5 second (timeout) in Opera.');

  // don't load multi times
  require.async('./red.css');

  test.done();

});
