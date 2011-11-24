define('http://a.tbcdn.cn/p/test/main', function(require) {

  var a = require('./a');

  test.assert(a.name === 'a', a.name);
  test.assert(true, 'main is ok');
  test.done();

});

define('http://a.tbcdn.cn/p/test/a', { name: 'a' });
