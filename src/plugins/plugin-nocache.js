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
      data.requestUri = requestUri +
          (requestUri.indexOf("?") === -1 ? "?" : "&")
          + noCacheTimeStamp
    }
  })

  // Restore the original uri in deriving case for IE6-9
  seajs.on("resolve", function(data) {
    var derivedUri = data.id

    if (derivedUri.indexOf(noCachePrefix) > -1) {
      data.uri = derivedUri
          .replace(noCachePrefix, "")
          .replace(/[?&]$/, "")
    }
  })

})(seajs);

