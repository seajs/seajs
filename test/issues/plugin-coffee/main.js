
var MODULES_PATH = 'http://modules.seajs.com/';

if (location.href.indexOf('/~lifesinger/') > 0) {
  MODULES_PATH = 'http://' + location.host + '/~lifesinger/spm/modules/';
}


seajs.config({
  base: MODULES_PATH,

  alias: {
    'coffee':  'coffee/1.1.2/coffee-script'
  },

  preload: ['plugin-coffee']
});


define(function(require) {

  var test = require('../../test');

  var a = require('./a.coffee');
  var b = require('./b.coffee');

  test.assert(a.name === 'a', a.name);
  test.assert(b.name === 'b', b.name);
  test.assert(b.a === a, b.a.name);

  test.done();
});
