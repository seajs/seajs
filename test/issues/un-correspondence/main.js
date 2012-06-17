define('http://a.tbcdn.cn/p/test/main', function(require, exports, module) {

  console.dir(module)

  var a = require('./a');

  test.assert(a.name === 'a', a.name);
  test.assert(true, 'main is ok');
  test.done();

});

define('http://a.tbcdn.cn/p/test/a', { name: 'a' });
