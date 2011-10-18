
seajs.config({
  timeout: 5000,
  alias: {
    'jquery': 'http://modules.seajs.com/jquery/1.6.4/jquery.js'
  }
});


define(function(require) {

  var test = require('../../test');
  var $ = require('jquery');

  require('./red.css');
  test.assert($('#red').width() === 200, '#red width should be 200');

  test.assert($('#blue').width() !== 200, '#blue width should not be 200');
  require.async('./blue.css', function() {
    test.assert($('#blue').width() === 200, '#blue width should be 200 now');
  });

  require.async('./notExisted.css', function() {
    test.print('404!');
  });
  test.print('** 404 will occur after 5 second (timeout) in Opera.');

  test.done();

});
