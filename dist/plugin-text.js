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

    exec: function(data) {
      globalEval('define("' + jsEscape(data) + '")')
    }
  })

  // json
  addPlugin({
    name: "json",

    ext: [".json"],

    exec: function(data) {
      globalEval("define(" + data + ")")
    }
  })


  seajs.on("resolve", function(data) {
    var id = data.id

    // text!path/to/some ==> path/to/some#text#
    var m = id.match(/^(\w+)!(.+)$/)
    if (m && isPlugin(m[1])) {
      data.id = m[2] + "#" + m[1] + "#"
      return
    }

    // path/to/a.tpl?v2  ==> path/to/a.tpl?v2#text#
    m = id.match(/[^?]+(\.\w+)/)
    if (m) {
      data.id = id + "#" + getPluginName(m[1]) + "#"
    }
  })


  seajs.on("request", function(data) {
    var uri = data.uri
    var m = uri.match(/^(.+)#(\w+)$/)

    if (m && isPlugin(m[2])) {
      xhr(uri, function(data) {
        plugins[m[2]].exec(data)
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

