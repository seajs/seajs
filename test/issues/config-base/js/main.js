define(function(require) {

  var test = require('../../../test');

  var a = require('a');
  var b = require('biz/b');
  var c = require('biz/sub/c');
  var xxlib = require('xxlib');

  test.assert(a.a === 'a', 'a is ok');
  test.assert(b.b === 'b', 'b is ok');
  test.assert(c.c === 'c', 'c is ok');
  test.assert(xxlib.name === 'xxlib', 'xxlib is ok');


  seajs.config({
    base: 'xx'
  });

  test.assert(
      require.resolve('z').indexOf('/config-base/xx/z.js') > 0,
      require.resolve('z')
  );


  test.done();

});
