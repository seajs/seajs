/**
 * The plugin to load text resources such as template, json
 */
(function(global) {

  var plugins = {}

  function addPlugin(o) {
    plugins[o.name] = o
  }

  // normal text
  addPlugin({
    name: "text",

    ext: [".tpl", ".htm", ".html"],

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

    // text!path/to/some ==> path/to/some!text#
    if ((m = id.match(/^(\w+)!(.+)$/)) && isPlugin(m[1])) {
      pluginName = m[1]
      id = m[2]
    }
    // path/to/a.tpl?v2  ==> path/to/a.tpl?v2!text#
    else if ((m = id.match(/[^?]+(\.\w+)/))) {
      pluginName = getPluginName(m[1])
    }

    if (pluginName) {
      data.id = normalize(id) + "!" + pluginName + "#"
    }
  })


  seajs.on("request", function(data) {
    var uri = data.uri
    var m = uri.match(/^(.+)!(\w+)$/)

    if (m && isPlugin(m[2])) {
      xhr(m[1], function(content) {
        plugins[m[2]].exec(content)
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

  function normalize(id) {
    var lastChar = id.charAt(id.length - 1)
    if (lastChar === "#") {
      id = id.slice(0, -1)
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

