var MODULES_PATH = 'http://modules.seajs.org/';

if (location.href.indexOf('/~lifesinger/') > 0) {
  MODULES_PATH = 'http://' + location.host + '/~lifesinger/spm/modules/';
}

seajs.config({
  base: MODULES_PATH,

  timeout: 10000,

  alias: {
    'jq164': MODULES_PATH + 'jquery/1.6.4/jquery',
    'jq171': MODULES_PATH + 'jquery/1.7.1/jquery',
    'jquery': MODULES_PATH + 'jquery/1.6.4/jquery'
  }
});

define(function(require) {
  var test = require('../../test');

  test.assert(require('jq164').fn.jquery === '1.6.4', 'jq164 is ok');
  test.assert(require('jq171').fn.jquery === '1.7.1', 'jq171 is ok');
  test.assert(require('jquery').fn.jquery === '1.6.4', 'jquery is ok');

  test.done();
});
