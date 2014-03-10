(function(){
/**
 * The Sea.js plugin for loading text resources such as template, json etc
 */

var global = window
var plugins = {}
var uriCache = {}

function register(o) {
  plugins[o.name] = o
}

// normal text
register({
  name: "text",

  ext: [".tpl", ".html"],

  exec: function(uri, content) {
    globalEval('define("' + uri + '#", [], "' + jsEscape(content) + '")')
  }
})

// json
register({
  name: "json",

  ext: [".json"],

  exec: function(uri, content) {
    globalEval('define("' + uri + '#", [], ' + content + ')')
  }
})

// for handlebars template
register({
  name: "handlebars",

  ext: [".handlebars"],

  exec: function(uri, content) {
    var code = [
      'define("' + uri + '#", ["handlebars"], function(require, exports, module) {',
      '  var source = "' + jsEscape(content) + '"',
      '  var Handlebars = require("handlebars")',
      '  module.exports = function(data, options) {',
      '    options || (options = {})',
      '    options.helpers || (options.helpers = {})',
      '    for (var key in Handlebars.helpers) {',
      '      options.helpers[key] = options.helpers[key] || Handlebars.helpers[key]',
      '    }',
      '    return Handlebars.compile(source)(data, options)',
      '  }',
      '})'
    ].join('\n')

    globalEval(code)
  }
})


seajs.on("resolve", function(data) {
  var id = data.id
  if (!id) return ""

  var pluginName
  var m

  // text!path/to/some.xx
  if ((m = id.match(/^(\w+)!(.+)$/)) && isPlugin(m[1])) {
    pluginName = m[1]
    id = m[2]
  }
  // http://path/to/a.tpl
  // http://path/to/c.json?v2
  else if ((m = id.match(/[^?]+(\.\w+)(?:\?|#|$)/))) {
    pluginName = getPluginName(m[1])
  }

  if (pluginName && id.indexOf("#") === -1) {
    id += "#"
  }

  var uri = seajs.resolve(id, data.refUri)

  if (pluginName) {
    uriCache[uri] = pluginName
  }

  data.uri = uri
})

seajs.on("request", function(data) {
  var name = uriCache[data.uri]

  if (name) {
    xhr(data.requestUri, function(content) {
      plugins[name].exec(data.uri, content)
      data.onRequest()
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
      // Support local file
      if (r.status > 399 && r.status < 600) {
        throw new Error("Could not load: " + url + ", status = " + r.status)
      }
      else {
        callback(r.responseText)
      }
    }
  }

  return r.send(null)
}

function globalEval(content) {
  if (content && /\S/.test(content)) {
    (global.execScript || function(content) {
      (global.eval || eval).call(global, content)
    })(content)
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

function pure(uri) {
  // Remove timestamp etc
  return uri.replace(/\?.*$/, "")
}

define("seajs/seajs-text/1.0.2/seajs-text-debug", [], {});
})();