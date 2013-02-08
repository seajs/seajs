/**
 * Display warning messages in console to discover potential errors
 */
(function(seajs) {

  var uriCache = {}
  var RE_VERSION = /\/(?:\d+\.){1,2}\d+\/|\D(?:\d+\.){1,2}\d+[^/]*\.(?:js|css)\W?/

  seajs.on("save", checkMultiVersion)


  // Only support this version style:
  // `zz/1.2.3/xx`
  // `zz/xx-1.2.3-beta.js`
  // `zz/xx.1.2.3.rc2.js`
  function checkMultiVersion(data) {
    var uri = data.uri
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

