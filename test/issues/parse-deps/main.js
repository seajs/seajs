define(function(require, exports, module) {

  var test = require('../../test');

require('./a');
  require('b');
  require('"c');require(' c');
  require('c)');
  var o = {
    require: function() {

    }
  };
  o.require('d');
  o.require(require('e'   ));

  var $require = function() {};
  $require('#197');


  test.assert(require('b').name === 'b', 'b');
  test.assert(require('e').name === 'e', 'e');
  test.assert(module.dependencies.length === 4, module.dependencies);

  test.done();
  
});

define('b', { name: 'b' });
define('e', { name: 'e' });