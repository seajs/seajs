/**
 * Disable cache by adding a timestamp to each http request
 */

define('{seajs}/plugin-nocache', [], function() {

  var noCachePrefix = 'seajs-nocache='
  var noCacheTimeStamp = noCachePrefix + new Date().getTime()
  var uriCache = {}

  // Add a timestamp to each request
  seajs.on('fetch', function(data) {
    var uri = data.uri
    var requestUri = uri

    if (uri.indexOf(noCachePrefix) === -1) {
      requestUri = uri + (uri.indexOf('?') === -1 ? '?' : '&')
          + noCacheTimeStamp
      uriCache[requestUri] = uri
    }

    data.uri = requestUri
  })

  // Restore the original uri in automatically deriving case
  seajs.on('derived', function(data) {
    var requestUri = data.uri
    data.uri = uriCache[requestUri] || requestUri
  })

});

