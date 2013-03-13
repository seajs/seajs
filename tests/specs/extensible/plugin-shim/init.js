define(function(require) {

  var test = require('../../../test')
  var $ = require('jquery')
  require('jquery.easing')

  test.assert($.jquery === '1.9.1', $.jquery)
  test.assert($.easing.name === 'easing', $.easing.name)

  test.assert(global.jQuery === $, 'global.jQuery === $')
  global.jQuery = undefined


  var Backbone = require('backbone')

  test.assert(Backbone.name === 'backbone', Backbone.name)
  test.assert(Backbone._.name === 'underscore', Backbone._.name)
  global.Backbone = undefined
  global._ = undefined


  test.next()

})

