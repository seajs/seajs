/**
 * Add the capability to load CMD modules in node environment
 * @author lifesinger@gmail.com
 */

var fs = require("fs")
var path = require("path")
var vm = require("vm")

runSeaJS("../dist/sea-debug.js")

attach()
keep()

seajs.cwd(process.cwd())


function runSeaJS(filepath) {
  var code = fs.readFileSync(path.join(__dirname, filepath), "utf8")
  code = code.replace("})(this);", "})(exports);")

  // Run "sea.js" code in a fake browser environment
  var sandbox = require("./sandbox")
  vm.runInNewContext(code, sandbox, "sea-debug.vm")

  global.seajs = sandbox.exports.seajs
  global.define = sandbox.exports.define
}

function attach() {
  seajs.on("request", request)
}

function request(data) {
  var requestUri =  pure(data.requestUri)
  var ext = path.extname(requestUri)
  //process.stdout.write("requestUri = " + requestUri + "\n")

  if (ext === ".js") {
    // Use native `require` instead of script-inserted version
    require(requestUri)
    data.callback()
    data.requested = true
  }
  // Throw error if this function is the last request handler
  else if (seajs.events["request"].length === 1) {
    throw new Error("Do NOT support to load this file in node environment: "
        + requestUri)
  }
}

function keep() {
  var _off = seajs.off

  seajs.off = function() {
    _off()
    attach()
    return seajs
  }
}

function pure(uri) {
  // Remove timestamp etc
  return uri.replace(/\?.*$/, "")
}

