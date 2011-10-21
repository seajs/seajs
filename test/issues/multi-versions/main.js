var MODULES_PATH = 'http://modules.seajs.com/';

if (location.href.indexOf('/localhost/~lifesinger/') > 0) {
  MODULES_PATH = 'http://localhost/~lifesinger/spm/modules/';
}

seajs.config({
  timeout: 10000,
  alias: {
    'jq162': MODULES_PATH + 'jquery/1.6.2/jquery.js',
    'jq164': MODULES_PATH + 'jquery/1.6.4/jquery.js',
    'jquery': MODULES_PATH + 'jquery/1.6.4/jquery.js'
  }
});

define(function(require) {
  var test = require('../../test');

  test.assert(require('jquery').fn.jquery === '1.6.2', 'jquery is ok');
  test.assert(require('jq162').fn.jquery === '1.6.2', 'jq162 is ok');
  test.assert(require('jq164').fn.jquery === '1.6.4', 'jq164 is ok');
});
