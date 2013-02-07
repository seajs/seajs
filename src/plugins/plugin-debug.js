/**
 * The debug plugin for SeaJS
 */
(function(seajs, global, doc, loc) {

  var config = getConfig()

  // Force debug to true when url contains `?seajs-debug`
  if (loc.search.indexOf("seajs-debug") > -1) {
    config.debug = 1
    config.console = 1
    saveConfig(config)
  }

  // Set debug config
  if (config.debug) {
    seajs.config({
      debug: true
    })
  }

  // Load the map file
  if (config.mapfile) {
    doc.title = "[seajs debug mode] - " + doc.title
    seajs.config({
      preload: config.mapfile
    })
  }

  // Show console window
  if (config.console) {
    showConsole(config.mapfile)
  }

  // Add find method to seajs in debug mode
  if (!seajs.find) {
    var cachedModules = seajs.cache

    seajs.find = function(selector) {
      var matches = []

      for(var uri in cachedModules) {
        if (cachedModules.hasOwnProperty(uri)) {
          if (typeof selector === "string" && uri.indexOf(selector) > -1 ||
              selector instanceof RegExp && selector.test(uri)) {
            var mod = cachedModules[uri]
            mod.exports && matches.push(mod.exports)
          }
        }
      }

      return matches
    }
  }


  // Helpers

  function showConsole(mapfile) {
    var style =
        "#seajs-debug-console { " +
        "  position: fixed; bottom: 10px; " +
        "  *position: absolute; *top: 10px; *width: 465px; " +
        "  right: 10px; z-index: 999999999;" +
        "  background: #fff; color: #000; font: 12px arial;" +
        "  border: 2px solid #000; padding: 0 10px 10px;" +
        "}" +
        "#seajs-debug-console h3 {" +
        "  margin: 3px 0 6px -6px; padding: 0;" +
        "  font-weight: bold; font-size: 14px;" +
        "}" +
        "#seajs-debug-console input {" +
        "  width: 400px; margin-left: 10px;" +
        "}" +
        "#seajs-debug-console button {" +
        "  float: right; margin: 6px 0 0 10px;" +
        "  box-shadow: #ddd 0 1px 2px;" +
        "  font-size: 14px; padding: 4px 10px;" +
        "  color: #211922; background: #f9f9f9;" +
        "  text-shadow: 0 1px #eaeaea;" +
        "  border: 1px solid #bbb; border-radius: 3px;" +
        "  cursor: pointer; opacity: .8" +
        "}" +
        "#seajs-debug-console button:hover {" +
        "  background: #e8e8e8; text-shadow: none; opacity: 1" +
        "}" +
        "#seajs-debug-console a {" +
        "  position: relative; top: 10px; text-decoration: none;" +
        "}"

    var html =
        "<div id=\"seajs-debug-console\">" +
        "  <h3>SeaJS Debug Console</h3>" +
        "  <label>Map file: <input value=\"" + mapfile + "\"/></label><br/>" +
        "  <button>Exit</button>" +
        "  <button>Hide</button>" +
        "  <button>Save</button>" +
        "</div>"

    var div = doc.createElement("div")
    div.innerHTML = html

    importStyle(style)
    appendToBody(div)

    var buttons = div.getElementsByTagName("button")

    // save
    buttons[2].onclick = function() {
      var href = div.getElementsByTagName("input")[0].value || ""
      config.mapfile = href
      saveConfig(config)
      loc.reload()
    }

    // hide
    buttons[1].onclick = function() {
      config.console = 0
      saveConfig(config)
      loc.replace(loc.href.replace("seajs-debug", ""))
    }

    // exit
    buttons[0].onclick = function() {
      config.debug = 0
      saveConfig(config)
      loc.replace(loc.href.replace("seajs-debug", ""))
    }
  }

  function getConfig() {
    var cookie = "", m

    if ((m = doc.cookie.match(
        /(?:^| )seajs-debug(?:(?:=([^;]*))|;|$)/))) {
      cookie = m[1] ? decodeURIComponent(m[1]) : ""
    }

    var parts = cookie.split("`")
    return {
      debug: Number(parts[0]) || 0,
      mapfile: parts[1] || "",
      console: Number(parts[2]) || 0
    }
  }

  function saveConfig(o) {
    var date = new Date()
    date.setTime(date.getTime() + 30 * 86400000) // 30 days

    doc.cookie = "seajs-debug=" + o.debug + "`" + o.mapfile + "`" +
        o.console + "; path=/; expires=" + date.toUTCString()
  }

  var MAX_TRY = 100
  var pollCount = 0

  function appendToBody(div) {
    pollCount++

    if (doc.body) {
      doc.body.appendChild(div)
    }
    else if (pollCount < MAX_TRY) {
      setTimeout(function() {
        appendToBody(div)
      }, 200)
    }
  }

  function importStyle(cssText) {
    var element = doc.createElement("style")

    // Add to DOM first to avoid the css hack invalid
    doc.getElementsByTagName("head")[0].appendChild(element)

    // IE
    if (element.styleSheet) {
      element.styleSheet.cssText = cssText
    }
    // W3C
    else {
      element.appendChild(doc.createTextNode(cssText))
    }
  }

})(seajs, this, document, location);

