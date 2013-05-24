
define(function(require, exports, mod) {

  var test = require('../../../test')

  test.assert(seajs.config() === seajs, 'sea.config is chainable')
  test.assert(seajs.emit() === seajs, 'sea.emit is chainable')
  test.assert(seajs.on() === seajs, 'sea.on is chainable')
  test.assert(seajs.off() === seajs, 'sea.off is chainable')
  test.assert(seajs.log() === undefined, 'sea.log is NOT chainable')
  test.assert(seajs.use() === seajs, 'sea.use is chainable')
  test.assert(seajs.cwd(seajs.cwd()) === seajs.cwd(), 'sea.cwd is NOT chainable')

  //seajs.log(require.resolve('./a'))

  test.assert(require.async('./a') === require, 'require.async is chainable')
  //test.assert(mod.load('./a') === undefined, 'module.load is NOT chainable')

  test.next()

});

