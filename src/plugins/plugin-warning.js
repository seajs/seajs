/**
 * Display warning messages in console to discover potential errors
 */
(function(seajs) {

  var uriCache = {}
  var RE_VERSION = /(?:\d+\.)+\d+/

  seajs.on("saved", checkMultiVersion)


  // Only support this version style: `zz/1.2.3/xx` or `zz/xx-1.2.3.js`
  function checkMultiVersion(mod) {
    var uri = mod.uri
    if (!RE_VERSION.test(uri)) return

    var key = uri.replace(RE_VERSION, "{version}")
    var versions = uriCache[key] || (uriCache[key] = [])
    versions.push(uri)

    if (versions.length > 1) {
      seajs.log("This module has multiple versions:\n" +
          versions.join("\n"), "warn")
    }
  }

})(seajs);

