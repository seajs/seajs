var MODULES_PATH = 'http://modules.seajs.com/';

if (location.href.indexOf('/~lifesinger/') > 0) {
  MODULES_PATH = 'http://' + location.host + '/~lifesinger/spm/modules/';
}

seajs.config({
  base: MODULES_PATH,

  timeout: 10000,

  alias: {
    'jquery': MODULES_PATH + 'jquery/1.6.4/jquery.js'
  }
});


define(function(require) {

  var test = require('../../test');
  var $ = require('jquery');

  require('./red.css');
  test.assert($('#red').width() === 200, '#red width should be 200');

  test.assert($('#blue').width() !== 200, '#blue width should not be 200');
  require.async('./blue.css', function() {
    setTimeout(function() {
      test.assert($('#blue').width() === 200, '#blue width should be 200 now');
    }, 500);
  });

  require.async('./notExisted.css', function() {
    test.print('404!');
  });
  test.print('** 404 will occur after 5 second (timeout) in Opera.');

  require.async('./red.css');
  require('./blue.css');
  
  test.done();

});
