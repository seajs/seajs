/**
 * The base utilities for plugin development
 */
define('seajs/plugin-base', [], function(require, exports) {

  var pluginSDK = seajs.pluginSDK
  var util = pluginSDK.util
  var Module = pluginSDK.Module

  var pluginsInfo = {}
  var uriCache = {}


  exports.add = function(o) {
    pluginsInfo[o.name] = o
  }


  exports.util = {
    xhr: xhr,
    globalEval: globalEval
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
      if (m && isPluginName(m[1])) {
        pluginName = m[1]
        parsedId = m[2]
      }

      // Parse alias first
      parsedId = '#' + util.parseAlias(parsedId)

      // id = abc.xyz?t=123
      if (!pluginName && (m = parsedId.match(/[^?]*(\.\w+)/))) {
        var ext = m[1]

        for (var k in pluginsInfo) {
          if (isPluginName(k) &&
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

      if (isPluginName(pluginName) && !uriCache[uri]) {
        uriCache[uri] = pluginName
      }

      return uri
    }
  }


  function extendFetch() {
    var _fetch = Module._fetch

    Module._fetch = function(url, callback, charset) {
      var pluginName = uriCache[util.unParseMap(url)]

      if (pluginName) {
        pluginsInfo[pluginName].fetch(url, callback, charset)
        return
      }

      _fetch(url, callback, charset)
    }
  }


  function xhr(url, callback) {
    var r = window.ActiveXObject ?
        new window.ActiveXObject('Microsoft.XMLHTTP')
        : new window.XMLHttpRequest()

    r.open('GET', url, true)

    r.onreadystatechange = function() {
      if (r.readyState === 4) {
        if (r.status === 200) {
          callback(r.responseText)
        }
        else {
          throw new Error('Could not load: ' + url + ', status = ' + r.status)
        }
      }
    }

    return r.send(null)
  }


  function globalEval(data) {
    if (data && /\S/.test(data)) {
      (window.execScript || function(data) {
        window['eval'].call(window, data)
      })(data)
    }
  }


  function isPluginName(name) {
    return name && pluginsInfo.hasOwnProperty(name)
  }

});

