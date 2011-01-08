
S.using('./submodule/a').as('a')
 .using('./submodule/b').as('b')
 .declare(function(require, exports) {

  var a = require('a');
  var b = require('b');

  S.log(a.foo === b.foo);

});
