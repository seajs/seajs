define(function(require) {

  var test = require('../../test')
  var assert = test.assert
  var obj = seajs
  obj.counter = 0


  // on and emit
  obj.on('event', function() {
    obj.counter += 1
  })

  obj.emit('event')
  assert(obj.counter === 1, obj.counter)

  obj.emit('event')
  obj.emit('event')
  obj.emit('event')
  obj.emit('event')
  assert(obj.counter === 5, obj.counter)


  // off all events
  obj.off()
  obj.counter = 0
  obj.emit('event')
  assert(obj.counter === 0, obj.counter)


  // on, then unbind all functions
  obj.off()
  obj.counter = 0

  function callback() {
    obj.counter += 1
  }

  obj.on('event', callback)
  obj.emit('event')
  obj.off('event')
  obj.emit('event')
  assert(obj.counter === 1, obj.counter)


  // bind two callbacks, unbind only one
  obj.off()
  obj.counter = 0
  obj.counterA = 0
  obj.counterB = 0

  function callback2() {
    obj.counterA += 1
  }

  obj.on('event', callback2)
  obj.on('event', function() {
    obj.counterB += 1
  })
  obj.emit('event')
  obj.off('event', callback2)
  obj.emit('event')

  assert(obj.counterA === 1, obj.counterA)
  assert(obj.counterB === 2, obj.counterB)


  // unbind a callback in the midst of it firing
  obj.off()
  obj.counter = 0

  function callback3() {
    obj.counter += 1
    obj.off('event', callback3)
  }

  obj.on('event', callback3)
  obj.emit('event')
  obj.emit('event')
  obj.emit('event')

  assert(obj.counter === 1, obj.counter)


  // two binds that unbind themeselves
  obj.off()
  obj.counterA = 0
  obj.counterB = 0

  function incrA() {
    obj.counterA += 1
    obj.off('event', incrA)
  }

  function incrB() {
    obj.counterB += 1
    obj.off('event', incrB)
  }

  obj.on('event', incrA)
  obj.on('event', incrB)
  obj.emit('event')
  obj.emit('event')
  obj.emit('event')

  assert(obj.counterA === 1, obj.counterA)
  assert(obj.counterB === 1, obj.counterB)


  // splice bug for `off`
  obj.off()
  var counter = 0

  function f1() {
    counter++
  }

  function f2() {
    counter++
  }

  obj.on('event', f1)
  obj.on('event', f1)
  obj.on('event', f2)

  obj.emit('event')
  assert(counter === 3, counter)


  delete obj.counter
  delete obj.counterA
  delete obj.counterB

  test.next()

});

