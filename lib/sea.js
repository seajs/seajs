/**
 * Add the capability to load CMD modules in node environment
 * @author lifesinger@gmail.com
 */

var fs = require("fs")
var path = require("path")
var vm = require("vm")

runSeaJS("../dist/sea-debug.js")

hackNative()
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

var moduleStack = []

function hackNative() {
  var NodeModule = module.constructor
  var _load = NodeModule._load

  NodeModule._load = function(request, parent, isMain) {
    var exports = _load(request, parent, isMain)

    var filename = NodeModule._resolveFilename(request, parent)
    var mod = seajs.cache[filename]

    if (mod) {
      if (mod.status < 4) { // < STATUS_EXECUTING
        mod.constructor.load([filename], function() {})
      }
      exports = NodeModule._cache[filename] = mod.exports
    }

    return exports
  }

  var _compile = NodeModule.prototype._compile

  NodeModule.prototype._compile = function(content, filename) {
    moduleStack.push(this)
    try {
      return _compile.call(this, content, filename)
    }
    finally {
      moduleStack.pop()
    }
  }
}

function attach() {
  seajs.on("request", requestListener)
  seajs.on("define", defineListener)
}

function requestListener(data) {
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

function defineListener(data) {
  if (!data.uri) {
    data.uri = moduleStack[moduleStack.length - 1].id
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

