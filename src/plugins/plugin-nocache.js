/**
 * Disable cache by adding a timestamp to each http request
 */
(function(seajs) {

  var noCachePrefix = "seajs-nocache="
  var noCacheTimeStamp = noCachePrefix + new Date().getTime()

  // Add a timestamp to requestUri on fetching
  seajs.on("fetch", function(data) {
    var requestUri = data.requestUri || data.uri

    if (requestUri.indexOf(noCachePrefix) === -1) {
      requestUri += (requestUri.indexOf("?") === -1 ? "?" : "&")
          + noCacheTimeStamp
    }

    data.requestUri = requestUri
  })

  // Restore the original uri in automatically deriving case
  seajs.on("resolve", function(data) {
    var requestUri = data.id

    if (requestUri.indexOf(noCachePrefix) === -1) {
      data.uri = requestUri
          .replace(noCachePrefix, "")
          .replace(/[?&]$/, "")
    }
  })

})(seajs);

