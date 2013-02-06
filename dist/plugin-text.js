/**
 * The plugin to load text resources such as template, json
 */
(function(global) {

  var plugins = {}
  var uriCache = {}
  var ID_END_RE = /\.(?:css|js)\W|\/$/

  function addPlugin(o) {
    plugins[o.name] = o
  }

  // normal text
  addPlugin({
    name: "text",

    ext: [".tpl", ".html"],

    exec: function(content) {
      globalEval('define("' + jsEscape(content) + '")')
    }
  })

  // json
  addPlugin({
    name: "json",

    ext: [".json"],

    exec: function(content) {
      globalEval("define(" + content + ")")
    }
  })

  seajs.on("resolve", function(data) {
    var id = data.id
    var pluginName
    var m

    // text!path/to/some.xx
    if ((m = id.match(/^(\w+)!(.+)$/)) && isPlugin(m[1])) {
      pluginName = m[1]
      id = m[2]
    }
    // path/to/a.html
    // path/to/c.tpl?v2
    else if (!ID_END_RE.test(id) && (m = id.match(/[^?]+(\.\w+)/))) {
      pluginName = getPluginName(m[1])
    }

    if (pluginName) {
      var uri = data.id2Uri(id, data.refUri)
      uri = uri.replace(/\.js$/, "")

      uriCache[uri] = pluginName
      data.id = addEndTag(uri)
    }
  })

  seajs.on("request", function(data) {
    var uri = data.uri
    var name = uriCache[uri]

    if (name) {
      xhr(uri, function(content) {
        plugins[name].exec(content)
        data.callback()
      })

      data.requested = true
    }
  })


  // Helpers

  function isPlugin(name) {
    return name && plugins.hasOwnProperty(name)
  }

  function getPluginName(ext) {
    for (var k in plugins) {
      if (isPlugin(k)) {
        var exts = "," + plugins[k].ext.join(",") + ","
        if (exts.indexOf("," + ext + ",") > -1) {
          return k
        }
      }
    }
  }

  function addEndTag(id) {
    if (!/\?|#$/.test(id)) {
      id += "#"
    }
    return id
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

})(this);

