/**
 * Add the capability to load CMD modules in node environment
 * @author lifesinger@gmail.com
 */

var fs = require("fs")
var path = require("path")
var vm = require("vm")

runSeaJS("../dist/sea-debug.js")

attachEvent()
seajs.cwd(process.cwd())


function runSeaJS(filepath) {
  var code = fs.readFileSync(path.join(__dirname, filepath), "utf-8")
  code = code.replace("})(this);", "})(exports);")

  // Run "sea.js" code in a fake browser environment
  var sandbox = require("./sandbox")
  vm.runInNewContext(code, sandbox, "sea-debug.vm")

  global.seajs = sandbox.exports.seajs
  global.define = sandbox.exports.define
}

function attachEvent() {
  seajs.on("request", request)

  // Always keep this request event handler
  var _off = seajs.off
  seajs.off = function() {
    _off()
    return seajs.on("request", request)
  }
}

function request(data) {
  var requestUri = data.requestUri.replace(/\?.*$/, "") // No timestamp etc
  var ext = path.extname(requestUri)
  //process.stdout.write('requestUri = ' + requestUri + '\n')

  if (ext === ".js" || ext === ".json") {
    // Use native `require` instead of script-inserted version
    require(requestUri)
    data.callback()
  }
  else {
    throw new Error("Do NOT support to load this file in node environment: "
        + requestUri)
  }

  data.requested = true
}

