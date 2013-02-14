/**
 * Add the capability to load CMD modules in node environment
 * @author lifesinger@gmail.com
 */

var fs = require("fs")
var path = require("path")
var vm = require("vm")

// Run `sea.js` in fake browser environment
var code = fs.readFileSync("../dist/sea-debug.js", "utf-8")
code = code.replace("})(this);", "})(process);")
vm.runInNewContext(code, require("./sandbox"), "sea-debug.vm")

// Get global seajs and define
global.seajs = process.seajs
global.define = process.define
delete process.seajs
delete process.define

// Use native `require` to instead of script-inserted version
seajs.on("request", function(data) {
  var requestUri = data.requestUri

  // Remove timestamp etc
  requestUri = requestUri.replace(/\?.*$/, "")
  var ext = path.extname(requestUri)

  // Load js and json files and call onload immediately
  if (ext === ".js" || ext === ".json") {
    require(requestUri)
    data.callback()
  }
  else {
    // Ignore css file in node environment
    if (ext !== ".css") {
      throw new Error("Do NOT support to load this file type: " + ext)
    }
  }

  data.requested = true
})

