define(["../../test", "", null, undefined], function(require, exports, module) {

  var test = require('../../test');

  // 观察 network 面板，不会有无效 404 下载
  test.assert(module.dependencies.length === 1, 'remove invalid deps');
  test.done();

});
