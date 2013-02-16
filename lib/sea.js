/**
 * Add the capability to load CMD modules in node environment
 * @author lifesinger@gmail.com
 */

var fs = require("fs")
var path = require("path")
var vm = require("vm")

// Run "sea.js" code in a fake browser environment
var codefile = path.join(__dirname, "../dist/sea-debug.js")
var code = fs.readFileSync(codefile, "utf-8")
code = code.replace("})(this);", "})(process);")
vm.runInNewContext(code, require("./sandbox"), "sea-debug.vm")

// Get global `seajs` and `define`
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
    //console.log('  request ' + requestUri)
    require(requestUri)
    data.callback()
  }
  else {
    throw new Error(
        "  *** Do NOT support to load this file in node environment: "
            + requestUri)
  }

  data.requested = true
})

// Change current working directory
seajs.cwd(process.cwd())

