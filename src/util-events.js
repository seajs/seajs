/**
 * util-events.js - The minimal events support
 */

var eventsCache = {}

// Bind event
seajs.on = function(event, callback) {
  if (!callback) return seajs

  var list = eventsCache[event] || (eventsCache[event] = [])
  list.push(callback)

  return seajs
}

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
seajs.off = function(event, callback) {
  // Remove *all* events
  if (!(event || callback)) {
    eventsCache = {}
    return seajs
  }

  var list = eventsCache[event]
  if (list) {
    if (callback) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === callback) {
          list.splice(i, 1)
        }
      }
    }
    else {
      delete eventsCache[event]
    }
  }

  return seajs
}

// Emit event, firing all bound callbacks. Callbacks are passed the same
// arguments as `emit` is, apart from the event name
var emit = seajs.emit = function(event) {
  var list = eventsCache[event]
  if (!list) return seajs

  var args = []

  // Fill up `args` with the callback arguments.  Since we're only copying
  // the tail of `arguments`, a loop is much faster than Array#slice
  for (var i = 1, len = arguments.length; i < len; i++) {
    args[i - 1] = arguments[i]
  }

  // Copy callback lists to prevent modification
  list = list.slice()

  // Execute event callbacks
  forEach(list, function(fn) {
    fn.apply(global, args)
  })

  return seajs
}

// Emit event and return the specified property of the data
function emitData(event, data, prop) {
  emit(event, data)
  return data[prop || keys(data)[0]]
}


// For test environment
if(TEST_MODE) {
  test.emitData = emitData
}


