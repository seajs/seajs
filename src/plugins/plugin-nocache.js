/**
 * Disable cache by adding a timestamp to each http request
 */
(function(seajs) {

  var noCachePrefix = "seajs-nocache="
  var noCacheTimeStamp = noCachePrefix + new Date().getTime()
  var uriCache = {}

  // Add a timestamp to requestUri on fetching
  seajs.on("fetch", function(args) {
    var requestUri = args.requestUri || args.uri

    if (requestUri.indexOf(noCachePrefix) === -1) {
      requestUri += (requestUri.indexOf("?") === -1 ? "?" : "&")
          + noCacheTimeStamp

      uriCache[requestUri] = args.uri
      args.requestUri = requestUri
    }
  })

  // Restore the original uri in deriving case for IE6-9
  seajs.on("define", function(args) {
    if (uriCache[args.uri]) {
      args.uri = uriCache[args.uri]
    }
  })


  define(seajs.data.dir + "plugin-nocache", [], {})

})(seajs);

