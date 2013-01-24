/**
 * bootstrap.js - Initialize the plugins and load the entry module
 */

seajs.config({
  // Set `{seajs}` pointing to `http://path/to/sea.js` directory portion
  vars: { seajs: dirname(loaderUri) },

  // Preload all initial plugins
  preload: getBootstrapPlugins()
})

var dataMain = loaderScript.getAttribute("data-main")
if (dataMain) {
  seajs.use(dataMain)
}


// NOTE: use `seajs-xxx=1` flag in url or cookie to enable `plugin-xxx`
function getBootstrapPlugins() {
  var ret = []
  var str = global.location.search

  // Convert `seajs-xxx` to `seajs-xxx=1`
  str = str.replace(/(seajs-\w+)(&|$)/g, "$1=1$2")

  // Add cookie string
  str += " " + doc.cookie

  // Exclude seajs-xxx=0
  str.replace(/seajs-(\w+)=1/g, function(m, name) {
    ret.push("{seajs}/plugin-" + name)
  })

  return unique(ret)
}

