define(function(require) {

  var test = require('../../test')

  test.assert(seajs.log('a') === 'a', 'log')
  test.assert(seajs.log('a', 'b') === 'a b', 'log')
  test.assert(seajs.log('a', 'b', 1) === 'a b 1', 'log')

  test.assert(seajs.log('a', 'warn') === 'a', 'warn')
  test.assert(seajs.log('a', 'info') === 'a', 'info')
  test.assert(seajs.log('a', 'error') === 'a', 'error')
  test.assert(seajs.log('a', 'group').indexOf('a') === 0, 'group')
  test.assert(seajs.log('a', 'groupEnd').indexOf('a') === 0, 'groupEnd')
  test.assert(seajs.log('a', 'time').indexOf('a') === 0, 'time')
  test.assert(seajs.log('a', 'timeEnd').indexOf('a') === 0, 'timeEnd')

  test.assert(seajs.log('a', 'dir').indexOf('a') === 0, 'dir')
  test.assert(typeof seajs.log({ name: 'a' }, 'dir') === 'object', 'dir')

})
