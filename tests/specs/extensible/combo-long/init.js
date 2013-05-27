define(function(require) {

  var test = require('../../../test')

  var a = require('a')
  var b = require('b')
  var c = require('c')
  var d = require('d')
  var e = require('e')
  var f = require('f')
  var g = require('g')
  var h = require('h')

  test.assert(a.name === 'a', 'a')
  test.assert(a.g.name === 'g', 'a.g')
  test.assert(b.name === 'b', 'b')
  test.assert(b.h.name === 'h', 'b.h')

  test.assert(c.name === 'c', 'c')
  test.assert(d.name === 'd', 'd')
  test.assert(e.name === 'e', 'e')
  test.assert(f.name === 'f', 'f')
  test.assert(g.name === 'g', 'g')
  test.assert(h.name === 'h', 'h')

  test.next()

});

