/**
 * util-log.js - The tiny log function
 */

// The safe wrapper for `console.xxx` functions
// log("message") ==> console.log("message")
// log("message", "warn") ==> console.warn("message")
var log = seajs.log = function(msg, type) {
  var console = global.console

  if (console) {
    // Do NOT print `log(msg)` in non-debug mode
    if (type || configData.debug) {
      (console[type] || console["log"]).call(console, msg)
    }
  }

}


