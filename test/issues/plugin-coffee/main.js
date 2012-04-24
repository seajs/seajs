
var MODULES_PATH = 'http://modules.seajs.org/';

if (location.href.indexOf('/~lifesinger/') > 0) {
  MODULES_PATH = 'http://' + location.host + '/~lifesinger/seajs/spm/modules/';
}


seajs.config({
  debug: 2,

  base: MODULES_PATH,

  alias: {
    'coffee':  'coffee/1.1.2/coffee-script'
  },

  map: [
      ['a2.coffee', 'a.coffee']
  ],

  preload: ['plugin-coffee']
});


define(function(require) {

  var test = require('../../test');

  var a = require('./a2.coffee');
  var b = require('./b.coffee');
  var c = require('coffee!./c.coffee');

  test.assert(a.name === 'a', a.name);
  test.assert(b.name === 'b', b.name);
  test.assert(c.name === 'c', c.name);
  test.assert(b.a === a, b.a.name);

  test.done();
});
