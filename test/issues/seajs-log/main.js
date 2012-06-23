define(function(require) {

  var test = require('../../test')

  test.assert(seajs.log('a') === undefined, 'log')
  test.assert(seajs.log('a', 'b') === undefined, 'log')
  test.assert(seajs.log('a', 'b', 1) === undefined, 'log')

  test.assert(seajs.log('a', 'warn') === undefined, 'warn')
  test.assert(seajs.log('a', 'info') === undefined, 'info')
  test.assert(seajs.log('a', 'error') === undefined, 'error')
  test.assert(seajs.log('a', 'group') === undefined, 'group')
  test.assert(seajs.log('a', 'groupEnd') === undefined, 'groupEnd')
  test.assert(seajs.log('a', 'time') === undefined, 'time')
  test.assert(seajs.log('a', 'timeEnd') === undefined, 'timeEnd')

  test.assert(seajs.log('a', 'dir') === undefined, 'dir')
  test.assert(seajs.log({ name: 'a' }, 'dir') === undefined, 'dir')

  test.done()
  
})
