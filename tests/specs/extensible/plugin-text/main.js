
seajs.config({
  alias: {
    'd': 'path/to/d.json'
  },
  plugins: ['text']
})

define(function(require) {

  var test = require('../../../test')

  var isHTTP = global.location && location.protocol.indexOf('http') === 0
  var isNode = typeof process !== 'undefined'

  if (isHTTP || isNode) {
    seajs.use('./plugin-text/init')
  }
  else {
    test.next()
  }

})

