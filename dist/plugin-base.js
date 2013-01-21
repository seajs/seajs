/**
 * The base utilities for plugin development
 */
define('{seajs}/plugin-base', ['./plugin-sdk'], function(require, exports) {

  var pluginSDK = require('./plugin-sdk')
  var util = pluginSDK.util

  var pluginsInfo = {}
  var uriCache = {}


  exports.add = function(o) {
    pluginsInfo[o.name] = o
  }


  extendResolve()
  extendFetch()


  function extendResolve() {
    var _resolve = Module._resolve

    Module._resolve = function(id, refUri) {
      var pluginName
      var parsedId = id

      // id = text!path/to/some
      var m = id.match(/^(\w+)!(.+)$/)
      if (m && isPlugin(m[1])) {
        pluginName = m[1]
        parsedId = m[2]
      }

      // Parse alias first
      parsedId = util.parseAlias(parsedId)

      // id = abc.xyz?t=123
      if (!pluginName && (m = parsedId.match(/[^?]*(\.\w+)/))) {
        var ext = m[1]

        for (var k in pluginsInfo) {
          if (isPlugin(k) &&
              util.indexOf(pluginsInfo[k].ext, ext) > -1) {
            pluginName = k
            break
          }
        }
      }

      // Prevents adding the default `.js` extension
      if (pluginName && !/\?|#$/.test(parsedId)) {
        parsedId += '#'
      }


      // Don't pollute id when pluginName is not found
      var uri = _resolve(pluginName ? parsedId : id, refUri)

      if (isPlugin(pluginName) && !uriCache[uri]) {
        uriCache[uri] = pluginName
      }

      return uri
    }
  }


  function extendFetch() {
    seajs.on('request', function(data) {
      var url = data.uri
      var pluginName = uriCache[url]

      if (pluginName) {
        pluginsInfo[pluginName].fetch(url, data.callback, data.charset)
        data.requested = true
      }
    })
  }


  // Helpers

  function isPlugin(name) {
    return name && pluginsInfo.hasOwnProperty(name)
  }

});

