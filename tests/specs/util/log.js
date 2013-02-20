define(function(require) {

  var test = require('../../test')
  var assert = test.assert


  assert(seajs.log('seajs.log test', 'group') === undefined, 'group')

  assert(seajs.log('a') === undefined, 'log')
  assert(seajs.log('a ' + 1) === undefined, 'log')

  assert(seajs.log('a', 'warn') === undefined, 'warn')
  assert(seajs.log('a', 'info') === undefined, 'info')
  assert(seajs.log('a', 'error') === undefined, 'error')
  assert(seajs.log('a', 'time') === undefined, 'time')
  assert(seajs.log('a', 'timeEnd') === undefined, 'timeEnd')

  assert(seajs.log('a', 'dir') === undefined, 'dir')
  assert(seajs.log({ name: 'a' }, 'dir') === undefined, 'dir')

  assert(seajs.log('seajs.log test', 'groupEnd') === undefined, 'groupEnd')

  test.next()

});

