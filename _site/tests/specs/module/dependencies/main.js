
seajs.config({
  base: './dependencies'
});


define(function(require, exports, mod) {

  var test = require('../../../test')
  require('./invalid')

  //test.assert(('' in seajs.cache) === false, 'invalid dependencies should be removed')


  var a = "never-ending line\\";
  a ='\\';
  a = 1 / 2; //require("a2")

  a = 1 / 2
  require("./a")
  //require("b2")

  require('./a');
  require  ('b')
  require("b");
  var o = {
    require: function() {
    },
    f:require('./f')
  };
  o.require('d');
  o.require(require('e'   ));

  var $require = function() {};
  $require('$require');

  var xrequire = function() {};
  xrequire('xrequire');

  test.assert(require('./a').name === 'a', 'a');
  test.assert(require('b').name === 'b', 'b');
  test.assert(require('e').name === 'e', 'e');
  test.assert(mod.dependencies.length === 12, getFiles(mod.dependencies).join(' | '));

  test.next()


  function getFiles(uris) {
    var ret = []
    for (var i = 0; i < uris.length; i++) {
      ret[i] = uris[i].split('/').pop()
    }
    return ret
  }


  /**
   * @fileoverview Module authoring format.
   */

  var define = function() {
    // some comment
    var reg = /.*/g; // comment */
  }

  /* ok, I will disappear. */
  var s = '// i am string'; require('./x');
  var t = 'i am string too'; // require('z');

  /* will not // be removed */ var xx = 'a';

  //
  //     var Calendar = require('calendar');

  var str = " /* not a real comment */ ";
  var regex = /\/*.*/;
  var tt = '"\'';

  var xxxx = 'require("show_me_the_money")';

  var r = /\/*require('r')*/;
  var r2 = /require('r2')/;
  var weird = / \/\/ \/b\//g;

});

define('a', [], { name: 'a' });
define('b', [], { name: 'b' });
define('e', [], { name: 'e' });
