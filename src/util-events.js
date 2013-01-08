/**
 * The events support
 */
;(function(seajs, util) {

  var eventsCache = {}


  // Binds event.
  seajs.on = function(event, callback) {
    if (!callback) return this

    var list = eventsCache[event] || (eventsCache[event] = [])
    list.push(callback)
    return this
  }


  // Removes event. If `callback` is null, removes all callbacks for the
  // event. If `events` is null, removes all bound callbacks for all events.
  seajs.off = function(event, callback) {
    // Removing *all* events.
    if (!(event || callback)) {
      eventsCache = {}
      return this
    }

    var events = event ? [event] : util.keys(eventsCache)

    // Loop through the callback list, splicing where appropriate.
    while (event = events.shift()) {
      var list = eventsCache[event]
      if (!list) continue

      if (!callback) {
        delete eventsCache[event]
        continue
      }

      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === callback) {
          list.splice(i, 1)
        }
      }
    }

    return this
  }


  // Emits event, firing all bound callbacks. Callbacks are passed the same
  // arguments as `emit` is, apart from the event name.
  seajs.emit = function(event) {
    var list = eventsCache[event]
    if (!list) return this

    var args = []

    // Fill up `args` with the callback arguments.  Since we're only copying
    // the tail of `arguments`, a loop is much faster than Array#slice.
    for (var i = 1, len = arguments.length; i < len; i++) {
      args[i - 1] = arguments[i]
    }

    // Copy callback lists to prevent modification.
    list = list.slice()

    // Execute event callbacks.
    util.forEach(list, function(fn) {
      fn.apply(this, args)
    })

    return this
  }


  // For handy use.
  seajs.emitData = function(event, argName, argValue) {
    var data = {}
    data[argName] = argValue
    seajs.emit(event, data)
    return data[argName]
  }


})(seajs, seajs._util)

