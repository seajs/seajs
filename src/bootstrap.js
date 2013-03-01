/**
 * bootstrap.js - Initialize the plugins and load the entry module
 */

config({
  // Get initial plugins
  plugins: (function() {
    var ret

    // Convert `seajs-xxx` to `seajs-xxx=1`
    // NOTE: use `seajs-xxx=1` flag in url or cookie to enable `plugin-xxx`
    var str = loc.search.replace(/(seajs-\w+)(&|$)/g, "$1=1$2")

    // Add cookie string
    str += " " + doc.cookie

    // Exclude seajs-xxx=0
    str.replace(/seajs-(\w+)=1/g, function(m, name) {
      (ret || (ret = [])).push(name)
    })

    return ret
  })()
})

var dataConfig = loaderScript.getAttribute("data-config")
var dataMain = loaderScript.getAttribute("data-main")

// Add data-config to preload modules
if (dataConfig) {
  configData.preload.push(dataConfig)
}

if (dataMain) {
  seajs.use(dataMain)
}

// Enable to load `sea.js` self asynchronously
if (_seajs && _seajs.args) {
  var methods = ["define", "config", "use"]
  var args = _seajs.args
  for (var g = 0; g < args.length; g += 2) {
    seajs[methods[args[g]]].apply(seajs, args[g + 1])
  }
}

/*
 ;(function(m, o, d, u, l, a, r) {
 if(m[o]) return
 function f(n) { return function() { r.push(n, arguments); return a } }
 m[o] = a = { args: (r = []), config: f(1), use: f(2) }
 m.define = f(0)
 u = d.createElement("script")
 u.id = o + "node"
 u.async = true
 u.src = "path/to/sea.js"
 l = d.getElementsByTagName("head")[0]
 l.appendChild(u)
 })(window, "seajs", document);
 */
