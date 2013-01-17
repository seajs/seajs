/**
 * The tiny console
 */

// Keeps a reference to the original console. ref: #503
var console = global.console


// The safe wrapper of console.log/error/...
function log() {
  if (typeof console === 'undefined') return

  var args = Array.prototype.slice.call(arguments)

  var type = 'log'
  var last = args[args.length - 1]
  console[last] && (type = args.pop())

  // Prints log info in debug mode only.
  if (type === 'log' && !seajs.debug) return

  if (console[type].apply) {
    console[type].apply(console, args)
    return
  }

  // ref: issue#349
  var length = args.length
  if (length === 1) {
    console[type](args[0])
  }
  else if (length === 2) {
    console[type](args[0], args[1])
  }
  else if (length === 3) {
    console[type](args[0], args[1], args[2])
  }
  else {
    console[type](args.join(' '))
  }
}

