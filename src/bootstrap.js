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
