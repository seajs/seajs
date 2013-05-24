/**
 * util-log.js - The tiny log function
 */

// The safe wrapper for `console.xxx` functions
// log("message") ==> console.log("message")
// log("message", "warn") ==> console.warn("message")
var log = seajs.log = function(msg, type) {

  global.console &&
      // Do NOT print `log(msg)` in non-debug mode
      (type || configData.debug) &&
      // Set the default value of type
      (console[type || (type = "log")]) &&
      // Call native method of console
      console[type](msg)
}

