define(function(require) {

  var test = require('../../test')

  seajs.importStyle('#out { color: blue }', 'a')


  test.assert(document.getElementById('a').nodeName === 'STYLE', 'style')
  test.done()

})
