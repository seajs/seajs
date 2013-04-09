define(function(require) {

  var test = require('../../../test')
  var $ = require('jquery')
  require('jquery.easing')

  test.assert($.fn.jquery === '1.9.1', $.fn.jquery)
  test.assert($.easing.name === 'easing', $.easing.name)

  test.assert(global.jQuery === $, 'global.jQuery === $')
  global.jQuery = undefined


  var Backbone = require('backbone')

  test.assert(Backbone.name === 'backbone', Backbone.name)
  test.assert(Backbone._.name === 'underscore', Backbone._.name)
  global.Backbone = undefined
  global._ = undefined


  var bbb = require('bbb')
  test.assert(bbb === 'bbb aaa', bbb)
  global.aaa = undefined
  global.bbb = undefined


  var ccc = require('ccc')
  test.assert(ccc === 'ccc', ccc)
  global.ccc = undefined


  test.next()

})

