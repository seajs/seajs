define(function(require) {

  var test = require('../../test')

  require('./a-xx')
  require('./b-xx')


  test.assert(seajs.find('a-xx.js').name === 'a', 'find("a-xx.js")')
  test.assert(seajs.find('xx')[0].name === 'a', 'find("xx")[0].name')
  test.assert(seajs.find('xx')[1].name === 'b', 'find("xx")[1].name')
  test.assert(seajs.find('xx').length === 2, 'find("xx").length')
  test.assert(seajs.find('zz') === null, 'find("zz")')

  test.done()

})
