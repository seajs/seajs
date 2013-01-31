

define(function(require, exports, mod) {

  var test = require('../../../test')

  test.assert(seajs.config() === seajs, 'sea.config is chainable')
  test.assert(seajs.emit() === seajs, 'sea.emit is chainable')
  test.assert(seajs.on() === seajs, 'sea.on is chainable')
  test.assert(seajs.off() === seajs, 'sea.off is chainable')
  test.assert(seajs.log() === seajs, 'sea.log is chainable')
  test.assert(seajs.use() === seajs, 'sea.use is chainable')

  seajs.log(require.resolve('./a'))

  test.assert(require.async('./a') === require, 'require.async is chainable')
  test.assert(mod.load('./a') === mod, 'module.load is chainable')

  test.next()

});

