
seajs.config({
  debug: true
})


define(function(require) {

  var test = require('../../../test')

  var a = require('./simple/a')
  test.assert(a.name === 'a', 'a.name')
  test.assert(a.getB().name === 'b', 'a.getB().name')
  test.assert(a.getB().getA() === a, 'a.getB().getA')

  var b = require('./simple/b')
  test.assert(b.name, 'b.name')
  test.assert(b.getA() === a, 'b.getA')
  test.assert(b.getA().name === a.name, 'b.getA().name')
  test.assert(b.getA().getB() === b, 'b.getA().getB()')

  test.assert(require('./three/a').name = 'a', 'a -> b <-> c')

  var global = this
  var msg = global.consoleMsg
  test.assert(msg.indexOf('Found circular dependencies') === 0, 'Check circular dependencies')
  test.assert(msg.indexOf('-->') > 0, 'Check circular dependencies')

  var m = require('./monkeys/m')
  test.assert(m.name === 'monkeys', m.name)
  test.assert(m.count === 10, 'monkeys are permitted')

  test.next()

});
