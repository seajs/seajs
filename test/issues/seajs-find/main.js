define(function(require) {

  var test = require('../../test')

  require('./a-xx')
  require('./b-xx')


  test.assert(seajs.find('a-xx.js').name === 'a', seajs.find("a-xx.js"))
  test.assert(seajs.find('xx')[0].name.length === 1, seajs.find("xx")[0].name)
  test.assert(seajs.find('xx')[1].name.length === 1, seajs.find("xx")[1].name)
  test.assert(seajs.find('xx').length === 2, seajs.find("xx").length)
  test.assert(seajs.find('zz') === null, seajs.find("zz"))

  test.done()

})
