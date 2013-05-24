define(function(require) {

  var test = require('../../../test')
  var Backbone = require('backbone')

  test.assert(Backbone.VERSION === '0.9.10', Backbone.VERSION)
  test.assert(Backbone._.VERSION === '1.4.4', Backbone._.VERSION)
  test.assert(Backbone.$.jquery === '1.9.1', Backbone.$.jquery)

  global.Backbone = undefined
  global.jQuery = undefined
  global._ = undefined

  test.next()

})
