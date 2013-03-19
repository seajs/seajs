/**
 * Display warning messages in console to discover potential errors
 */
(function(seajs) {

  var uriCache = {}
  var RE_VERSION = /\/(?:\d+\.){1,2}\d+\/|\D(?:\d+\.){1,2}\d+[^/]*\.(?:js|css)\W?/

  seajs.on("fetch", checkMultiVersion)


  // Only support this version style:
  // `zz/1.2.3/xx`
  // `zz/xx-1.2.3-beta.js`
  // `zz/xx.1.2.3.rc2.js`
  function checkMultiVersion(data) {
    var uri = data.uri
    if (!RE_VERSION.test(uri)) return

    var key = uri.replace(RE_VERSION, "{version}")
    var versions = uriCache[key] || (uriCache[key] = [])

    if (indexOf(versions, uri) === -1) {
      versions.push(uri)
    }

    if (versions.length > 1) {
      seajs.log("This module has multiple versions:\n" +
          versions.join("\n"), "warn")
    }
  }


  // Helpers

  var indexOf = [].indexOf ?
      function(arr, item) {
        return arr.indexOf(item)
      } :
      function(arr, item) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] === item) {
            return i
          }
        }
        return -1
      }

})(seajs);

