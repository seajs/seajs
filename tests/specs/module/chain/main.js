

define(function(require, exports, mod) {

  var test = require('../../../test')

  test.assert(seajs.config() === seajs, 'sea.config is chainable')
  test.assert(seajs.emit() === undefined, 'sea.emit is NOT chainable')
  test.assert(seajs.on() === undefined, 'sea.emit is NOT chainable')
  test.assert(seajs.off() === undefined, 'sea.emit is NOT chainable')
  test.assert(seajs.log() === seajs, 'sea.emit is chainable')
  test.assert(seajs.use() === seajs, 'sea.emit is chainable')

  test.assert(require.async('./a') === require, 'require.async is chainable')
  test.assert(mod.load('./a') === mod, 'module.load is chainable')

});

