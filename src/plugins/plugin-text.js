/**
 * The plugin to load text resources such as template, json
 */
define("{seajs}/plugin-text", [], function(require, exports) {

  var pluginsInfo = {}
  var uriCache = {}


  function registerTextPlugin(o) {
    pluginsInfo[o.name] = o
  }

  // normal text
  registerTextPlugin({
    name: "text",

    ext: [".tpl", ".htm", ".html"],

    fetch: function(url, callback) {
      util.xhr(url, function(data) {
        var str = jsEscape(data)
        util.globalEval('define([], "' + str + '")')
        callback()
      })
    }
  })

  // json
  registerTextPlugin({
    name: "json",

    ext: [".json"],

    fetch: function(url, callback) {
      xhr(url, function(text) {
        globalEval("define(" + text + ")")
        callback()
      })
    }
  })


  seajs.on('resolve', function(data) {
    var id = data.id
    var refUri = data.refUri

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
  })


  seajs.on('request', function(data) {
    var url = data.uri
    var pluginName = uriCache[url]

    if (pluginName) {
      pluginsInfo[pluginName].fetch(url, data.callback, data.charset)
      data.requested = true
    }
  })


  // Helpers

  var global = this

  function isPlugin(name) {
    return name && pluginsInfo.hasOwnProperty(name)
  }

  function xhr(url, callback) {
    var r = global.ActiveXObject ?
        new global.ActiveXObject("Microsoft.XMLHTTP") :
        new global.XMLHttpRequest()

    r.open("GET", url, true)

    r.onreadystatechange = function() {
      if (r.readyState === 4) {
        if (r.status === 200) {
          callback(r.responseText)
        }
        else {
          throw new Error("Could not load: " + url + ", status = " + r.status)
        }
      }
    }

    return r.send(null)
  }

  function globalEval(data) {
    if (data && /\S/.test(data)) {
      (global.execScript || function(data) {
        global["eval"].call(global, data)
      })(data)
    }
  }

  function jsEscape(content) {
    return content.replace(/(["\\])/g, "\\$1")
        .replace(/[\f]/g, "\\f")
        .replace(/[\b]/g, "\\b")
        .replace(/[\n]/g, "\\n")
        .replace(/[\t]/g, "\\t")
        .replace(/[\r]/g, "\\r")
        .replace(/[\u2028]/g, "\\u2028")
        .replace(/[\u2029]/g, "\\u2029")
  }

});

