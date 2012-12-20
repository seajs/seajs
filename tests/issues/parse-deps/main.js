define(function(require, exports, module) {

  var test = require('../../test');

  require('./a');
  require  ('b')
  require("b");
  require('"c');require(' c');
  require('c)');
  var o = {
    require: function() {
    },
    f:require('f')
  };
  o.require('d');
  o.require(require('e'   ));

  var $require = function() {};
  $require('$require');

  var xrequire = function() {};
  xrequire('xrequire');

  (function() {})('require("string");');

  test.assert(require('b').name === 'b', 'b');
  test.assert(require('e').name === 'e', 'e');
  test.assert(module.dependencies.some(function(dep) { return dep.indexOf('/x.js') !== -1; }), 'x');
  test.assert(!module.dependencies.some(function(dep) { return dep.indexOf('/string.js') !== -1; }), 'string');
  test.assert(module.dependencies.length === 6, module.dependencies);

  test.done();

  /**
   * @fileoverview Module authoring format.
   */

  var define = function() {
    // some comment
    var reg = /.*/g; // comment */
  }

  /* ok, I will disappear. */
  var s = '// i am string'; require('x');
  var t = 'i am string too'; // require('z');

  /* will not // be removed */ var xx = 'a';

  //
  //     var Calendar = require('calendar');

  var str = " /* not a real comment */ ";
  var regex = /\/*.*/;
  var tt = '"\'';
  var r = /\/*require('r')*/;
  var a = / \/\/ \/b\//g;

});

define('b', { name: 'b' });
define('e', { name: 'e' });