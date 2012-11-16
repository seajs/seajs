
seajs.config({
  map: [
      [/^.*\/dist\/a\.js.*$/, location.href.replace('test.html', 'a.js')]
  ]
})

define(function(require) {

  var test = require('../../test')

  require.async('a', function(a) {
    test.assert(a.name === 'a', a.name)
    test.done()
  })

})
