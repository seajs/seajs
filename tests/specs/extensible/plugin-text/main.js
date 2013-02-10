
seajs.config({
  alias: {
    'd': 'path/to/d.json'
  },
  plugins: ['text']
})

define(function(require) {

  var test = require('../../../test')

  // Only run this test specs in http environment
  if (location.protocol.indexOf('http') === 0) {
    seajs.use('./plugin-text/init')
  }
  else {
    test.next()
  }

})

