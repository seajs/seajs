define(function(require) {

  var test = require('../../../test')

  var a = require('./a-debug')

  test.assert(a.name === 'a', a.name)

  test.assert(document.getElementById('seajs-debug-console'), 'console div')


  require('./seajs-find/xx-1')
  require('./seajs-find/xx-2')

  test.assert(seajs.find('seajs-find/xx-1.js').length === 1, 'seajs.find')
  test.assert(seajs.find('seajs-find/xx-1.js')[0].name === '1', 'seajs.find')
  test.assert(seajs.find('seajs-find/xx').length === 2, 'seajs.find')
  test.assert(seajs.find('seajs-find/xx')[0].name === '1', 'seajs.find')
  test.assert(seajs.find('seajs-find/xx')[1].name === '2', 'seajs.find')
  test.assert(seajs.find('seajs-find/zz').length === 0, 'seajs.find')

})
