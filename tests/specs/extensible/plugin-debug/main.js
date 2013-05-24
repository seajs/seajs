define(function(require) {

  var test = require('../../../test')

  var a = require('./a')
  var b = require('./b')

  test.assert(a.name === 'a', a.name)
  test.assert(b.name === 'b', b.name)

  test.assert(document.getElementById('seajs-debug-console'), 'console div')


  require('./seajs-find/xx-1')
  require('./seajs-find/xx-2')

  test.assert(seajs.find('seajs-find/xx-1.js').length === 1, 'seajs.find')
  test.assert(seajs.find('seajs-find/xx-1.js')[0].name === '1', 'seajs.find')
  test.assert(seajs.find('seajs-find/xx').length === 2, 'seajs.find')
  test.assert(seajs.find('seajs-find/xx')[0].name === '1', 'seajs.find')
  test.assert(seajs.find('seajs-find/xx')[1].name === '2', 'seajs.find')
  test.assert(seajs.find('seajs-find/zz').length === 0, 'seajs.find')

  console.log(require.resolve('./c'))

  require.async('./c', function(c) {
    test.assert(c.name === 'c', c.name)

    document.cookie = 'seajs-debug=0``0; path=/; expires=' + new Date(0)
    test.next()
  })

})
