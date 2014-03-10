
seajs.config({
  debug: true
})


define(function(require) {

  var test = require('../../../test')
  var consoleMsgStack = global.consoleMsgStack


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


  var msg = consoleMsgStack.pop()
  test.assert(msg.indexOf('Circular dependencies') === 0, 'Check circular dependencies')
  test.assert(msg.indexOf('->') > 0, 'Check circular dependencies')

  var m = require('./monkeys/m')
  test.assert(m.name === 'monkeys', m.name)
  test.assert(m.count === 10, 'monkeys are permitted')


  global.execOrder = {
    stack: [],
    log: function(msg) {
      this.stack.push(msg)
    }
  }

  require('./exec-order/a').init()
  var stack = global.execOrder.stack
  test.assert(stack.join('') === 'abc', stack.join(' -> '))

  global.execOrder = undefined


  // issue #526
  require.async('./log-info/a', function(a) {

    // a -> b -> c -> d -> e -> e
    test.assert(a.name == 'a', a.name)
    test.assert(a.b.name == 'b', a.b.name)
    test.assert(a.b.c.name == 'c', a.b.c.name)
    test.assert(a.b.c.d.name == 'd', a.b.c.d.name)
    test.assert(a.b.c.d.e.name == 'e', a.b.c.d.e.name)
    test.assert(a.b.c.d.e.a === a, a.b.c.d.e.a.name)

    // c -> a
    test.assert(a.b.c.a === a, a.b.c.a.name)

    // e -> c
    test.assert(a.b.c.d.e.c === a.b.c, a.b.c.d.e.c.name)

    // console log messages
    var last = getFiles(consoleMsgStack.pop())
    var second = getFiles(consoleMsgStack.pop())
    var first = getFiles(consoleMsgStack.pop())

    // For Node.js
    if (last.length > second.length) {
      var t = second
      second = last
      last = t
    }

    test.assert(first.join(' -> ') === 'a.js -> b.js -> c.js -> a.js', first.join(' -> '))
    test.assert(second.join(' -> ') === 'a.js -> b.js -> c.js -> d.js -> e.js -> a.js', second.join(' -> '))
    test.assert(last.join(' -> ') === 'c.js -> d.js -> e.js -> c.js', last.join(' -> '))

    test.next()
  })


  function getFiles(msg) {
    var uris = msg.replace('Found circular dependencies: ', '').split(' -> ')
    return uris2files(uris)
  }

  function uris2files(uris) {
    var files = []
    for (var i = 0; i < uris.length; i++) {
      files[i] = uris[i].split('/').pop()
    }
    return files
  }

});
