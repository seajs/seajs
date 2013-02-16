/**
 * Add the capability to load CMD modules in node environment
 * @author lifesinger@gmail.com
 */

var fs = require("fs")
var path = require("path")
var vm = require("vm")

runSeaJS("../dist/sea-debug.js")

seajs.on("request", request)
hackOff()

seajs.cwd(process.cwd())


function runSeaJS(filepath) {
  var code = fs.readFileSync(path.join(__dirname, filepath), "utf-8")
  code = code.replace("})(this);", "})(process);")

  // Run "sea.js" code in a fake browser environment
  vm.runInNewContext(code, require("./sandbox"), "sea-debug.vm")

  global.seajs = process.seajs
  global.define = process.define
  delete process.seajs
  delete process.define
}

function request(data) {
  var requestUri = data.requestUri

  // Remove timestamp etc
  requestUri = requestUri.replace(/\?.*$/, "")
  var ext = path.extname(requestUri)

  if (ext === ".js" || ext === ".json") {
    // Use native `require` instead of script-inserted version
    require(requestUri)
    data.callback()
  }
  else {
    throw new Error(
        "  *** Do NOT support to load this file in node environment: "
            + requestUri)
  }

  data.requested = true
}

function hackOff() {
  var _off = seajs.off
  seajs.off = function() {
    _off()
    // Never off request handler added in this file
    seajs.on("request", request)
  }
}

