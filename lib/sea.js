/**
 * Add the capability to load CMD modules in node environment
 * @author lifesinger@gmail.com
 */

var fs = require("fs")
var path = require("path")
var vm = require("vm")
var normalize = require("./winos").normalize

var moduleStack = []
var uriCache = {}
var nativeLoad

runSeaJS("../dist/sea-debug.js")
hackNative()
attach()
keep()
seajs.config({ cwd: normalize(process.cwd()) + "/" })


function runSeaJS(filepath) {
  var code = fs.readFileSync(path.join(__dirname, filepath), "utf8")
  code = code.replace("})(this);", "})(exports);")

  // Run "sea.js" code in a fake browser environment
  var sandbox = require("./sandbox")
  vm.runInNewContext(code, sandbox, "sea-debug.vm")

  global.seajs = sandbox.exports.seajs
  global.define = sandbox.exports.define
}

function hackNative() {
  var Module = module.constructor
  nativeLoad = Module._load

  Module._load = function(request, parent, isMain) {
    var exports = nativeLoad(request, parent, isMain)

    var _filename = Module._resolveFilename(request, parent)
    var filename = normalize(_filename)

    var mod = seajs.cache[filename]
    if (mod) {
      if (mod.status < seajs.Module.STATUS.EXECUTING) {
        seajs.use(filename)
      }
      exports = Module._cache[_filename] = mod.exports
    }

    return exports
  }

  var _compile = Module.prototype._compile

  Module.prototype._compile = function(content, filename) {
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
  var requestUri = pure(data.requestUri)
  var ext = path.extname(requestUri)
  //process.stdout.write("requestUri = " + requestUri + "\n")

  if (ext === ".js") {
    // Use native `require` instead of script-inserted version
    nativeLoad(requestUri)
    data.onRequest()
    data.requested = true
  }
  // Throw error if this function is the last request handler
  else if (seajs.data.events["request"].length === 1) {
    throw new Error("Do NOT support to load this file in node environment: "
        + requestUri)
  }
}

function defineListener(data) {
  if (!data.uri) {
    var derivedUri = normalize(moduleStack[moduleStack.length - 1].id)
    data.uri = uriCache[derivedUri] || derivedUri
  }
}

function keep() {
  var _off = seajs.off
  var events = seajs.data.events

  seajs.off = function(name, callback) {
    // Remove *all* events
    if (!(name || callback)) {
      // For Node.js to work properly
      for (var prop in events) {
        delete events[prop]
      }
    }
    else {
      _off(name, callback)
    }

    attach()
    return seajs
  }
}

function pure(uri) {
  // Remove timestamp etc
  var ret = uri.replace(/\?.*$/, "")

  // Cache it
  if (ret !== uri) {
    uriCache[ret] = uri
  }
  return ret
}

