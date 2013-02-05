/**
 * bootstrap.js - Initialize the plugins and load the entry module
 */

var dataConfig = loaderScript.getAttribute("data-config")
var dataMain = loaderScript.getAttribute("data-main")

config({
  // Set `{seajs}` pointing to `http://path/to/sea.js` directory portion
  vars: { seajs: dirname(loaderUri) },

  // Add data-config to preload modules
  preload: dataConfig ? [dataConfig] : undefined,

  // Load initial plugins
  plugins: getBootstrapPlugins()
})

// NOTE: use `seajs-xxx=1` flag in url or cookie to enable `plugin-xxx`
function getBootstrapPlugins() {
  var ret = []

  // Convert `seajs-xxx` to `seajs-xxx=1`
  var str = loc.search.replace(/(seajs-\w+)(&|$)/g, "$1=1$2")

  // Add cookie string
  str += " " + doc.cookie

  // Exclude seajs-xxx=0
  str.replace(/seajs-(\w+)=1/g, function(m, name) {
    ret.push(name)
  })

  return ret.length ? unique(ret) : undefined
}


if (dataMain) {
  seajs.use(dataMain)
}
