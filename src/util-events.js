/**
 * util-events.js - The minimal events support
 */

var eventsCache = {}

// Bind event
seajs.on = function(event, callback) {
  if (!callback) return this

  var list = eventsCache[event] || (eventsCache[event] = [])
  list.push(callback)

  return this
}

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all events
seajs.off = function(event, callback) {
  // Remove *all* events
  if (!(event || callback)) {
    eventsCache = {}
    return this
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

  return this
}

// Emit event, firing all bound callbacks. Callbacks are passed the same
// arguments as `emit` is, apart from the event name
seajs.emit = function(event) {
  var list = eventsCache[event]
  if (!list) return this

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

  return this
}

// Emit event and return the specified data property
seajs.emitData = function(event, data, prop) {
  this.emit(event, data)
  return data[prop || keys(data)[0]]
}

