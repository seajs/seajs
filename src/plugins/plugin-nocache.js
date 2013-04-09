/**
 * Disable cache by adding a timestamp to each http request
 */
(function(seajs) {

  var noCachePrefix = "seajs-nocache="
  var noCacheTimeStamp = noCachePrefix + new Date().getTime()
  var uriCache = {}

  // Add a timestamp to requestUri on fetching
  seajs.on("fetch", function(data) {
    var requestUri = data.requestUri || data.uri

    if (requestUri.indexOf(noCachePrefix) === -1) {
      requestUri += (requestUri.indexOf("?") === -1 ? "?" : "&")
          + noCacheTimeStamp

      uriCache[requestUri] = data.uri
      data.requestUri = requestUri
    }
  })

  // Restore the original uri in deriving case for IE6-9
  seajs.on("define", function(data) {
    if (uriCache[data.uri]) {
      data.uri = uriCache[data.uri]
    }
  })

})(seajs);

