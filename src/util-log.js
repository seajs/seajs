/**
 * util-log.js - The tiny log function
 */

// The safe wrapper for `console.xxx` functions
// log("message") ==> console.log("message")
// log("message", "warn") ==> console.warn("message")
var log = seajs.log = function() {
  var console = global.console

  if (console === undefined) {
    return
  }

  var args = slice.call(arguments)
  var len = args.length
  var type = console[args[len - 1]] ? args.pop() : "log"

  // Print log info in debug mode only
  if (type === "log" && !configData.debug) {
    return
  }

  var fn = console[type]

  // The console function has no `apply` method in IE6-9
  fn = fn.apply ? fn.apply(console, args) : fn(args.join(' '))
}


