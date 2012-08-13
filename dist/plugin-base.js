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
    globalEval: globalEval,
    toRealPath: toRealPath
  }


  extendResolve()
  extendFetch()


  function extendResolve() {
    var _resolve = Module._resolve

    Module._resolve = function(id, refUri) {
      var manifest = Module._find('manifest')     
      var pluginName
      var m

      //manifest entries version control
      manifest && (refUri = toRealPath(refUri,manifest))
      // id = text!path/to/some
      if (m = id.match(/^(\w+)!(.+)$/)) {
        pluginName = m[1]
        id = m[2]
      }

      // Parse alias first
      id = '#' + util.parseAlias(id)

      // id = abc.xyz?t=123
      if (!pluginName && (m = id.match(/[^?]*(\.\w+)/))) {
        var ext = m[1]

        for (var k in pluginsInfo) {
          if (pluginsInfo.hasOwnProperty(k) &&
              util.indexOf(pluginsInfo[k].ext, ext) > -1) {
            pluginName = k
            break
          }
        }
      }

      // Prevents adding the default `.js` extension
      if (pluginName && !/\?|#$/.test(id)) {
        id += '#'
      }


      var uri = _resolve(id, refUri)

      if (pluginName && pluginsInfo[pluginName] && !uriCache[uri]) {
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

  function toRealPath(url,manifest){
    if(!manifest[url]) return url
    var m = url.match(/^(.*)\/(.*)$/),
        dirname = m[1],
        name = m[2],
        version = manifest[url]['version']
    if(!version) return url
    return dirname+'/'+version+'/'+name
  }

});