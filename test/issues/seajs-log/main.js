define(function(require) {

  var test = require('../../test')
  var oldIE = !!this.attachEvent


  oldIE || test.assert(seajs.log('seajs.log test', 'group') === undefined, 'group')

  test.assert(seajs.log('a') === undefined, 'log')
  test.assert(seajs.log('a', 'b') === undefined, 'log')
  test.assert(seajs.log('a', 'b', 1) === undefined, 'log')

  test.assert(seajs.log('a', 'warn') === undefined, 'warn')
  test.assert(seajs.log('a', 'info') === undefined, 'info')
  test.assert(seajs.log('a', 'error') === undefined, 'error')
  test.assert(seajs.log('a', 'time') === undefined, 'time')
  test.assert(seajs.log('a', 'timeEnd') === undefined, 'timeEnd')

  oldIE || test.assert(seajs.log('a', 'dir') === undefined, 'dir')
  oldIE || test.assert(seajs.log({ name: 'a' }, 'dir') === undefined, 'dir')

  oldIE || test.assert(seajs.log('seajs.log test', 'groupEnd') === undefined, 'groupEnd')

  test.done()

})
