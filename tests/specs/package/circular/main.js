
seajs.config({
  base: './circular/'
})


define(function(require) {

  var test = require('../../../test')

  var b = require('b')
  var b2 = require('b2')
  test.assert(b.name === 'b', 'circular in package b')
  test.assert(b.b2 === 'b2', 'circular in package b')
  test.assert(b2.name === 'b2', 'circular in package b')

  var a = require('a')
  test.assert(a.name === 'a', 'circular in package a')
  test.assert(a.a2 === 'a2', 'circular in package a')

  test.next()

});
