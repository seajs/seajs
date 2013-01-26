
seajs.config({
  base: './base/'
})


define(function(require) {

  var test = require('../../../test')
  var a = require('a')

  test.assert(a.name === 'a', a.name)


  seajs.config({
    base: './'
  })

  var base = seajs.config.data.base
  test.assert(/tests\/specs\/config\/$/.test(base), base)

  test.next()

})

