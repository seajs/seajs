/**
 * util-request.js - The utilities for requesting script and style files
 * ref: tests/research/load-js-css/test.html
 */

var head = doc.head ||
    doc.getElementsByTagName("head")[0] ||
    doc.documentElement

var baseElement = head.getElementsByTagName("base")[0]

var IS_CSS_RE = /\.css(?:\?|$)/i
var READY_STATE_RE = /loaded|complete|undefined/

var currentlyAddingScript
var interactiveScript


function request(url, callback, charset) {
  var isCSS = IS_CSS_RE.test(url)
  var node = doc.createElement(isCSS ? "link" : "script")

  if (charset) {
    var cs = isFunction(charset) ? charset(url) : charset
    if (cs) {
      node.charset = cs
    }
  }

  assetOnload(node, callback)

  if (isCSS) {
    node.rel = "stylesheet"
    node.href = url
  }
  else {
    node.async = "async"
    node.src = url
  }

  // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
  // the end of the insert execution, so use `currentlyAddingScript` to
  // hold current node, for deriving url in `define` call
  currentlyAddingScript = node

  // ref: #185 & http://dev.jquery.com/ticket/2709
  baseElement ?
      head.insertBefore(node, baseElement) :
      head.appendChild(node)

  currentlyAddingScript = null
}

function assetOnload(node, callback) {
  if (node.nodeName === "SCRIPT") {
    scriptOnload(node, callback)
  }
  else {
    styleOnload(node, callback)
  }
}

function scriptOnload(node, callback) {
  node.onload = node.onerror = node.onreadystatechange = function() {
    if (READY_STATE_RE.test(node.readyState)) {

      // Ensure only run once and handle memory leak in IE
      node.onload = node.onerror = node.onreadystatechange = null

      // Remove the script to reduce memory leak
      if (!configData.debug) {
        head.removeChild(node)
      }

      // Dereference the node
      node = undefined

      if (callback) {
        callback()
      }
    }
  }
}

function styleOnload(node, callback) {
  // for Old WebKit and Old Firefox
  if (isOldWebKit || isOldFirefox) {
    log("Start css polling")

    setTimeout(function() {
      pollCss(node, callback)
    }, 1) // Begin after node insertion
  }
  else {
    node.onload = node.onerror = function() {
      node.onload = node.onerror = null
      node = undefined

      if (callback) {
        callback()
      }
    }
  }
}

function pollCss(node, callback) {
  var sheet = node.sheet
  var isLoaded

  // for WebKit < 536
  if (isOldWebKit) {
    if (sheet) {
      isLoaded = true
    }
  }
  // for Firefox < 9.0
  else if (sheet) {
    try {
      if (sheet.cssRules) {
        isLoaded = true
      }
    } catch (ex) {
      // The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
      // to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
      // in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
      if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
        isLoaded = true
      }
    }
  }

  setTimeout(function() {
    if (isLoaded) {
      // Place callback in here due to giving time for style rendering
      callback()
    }
    else {
      pollCss(node, callback)
    }
  }, 1)
}

function getCurrentScript() {
  if (currentlyAddingScript) {
    return currentlyAddingScript
  }

  // For IE6-9 browsers, the script onload event may not fire right
  // after the the script is evaluated. Kris Zyp found that it
  // could query the script nodes and the one that is in "interactive"
  // mode indicates the current script
  // ref: http://goo.gl/JHfFW
  if (interactiveScript && interactiveScript.readyState === "interactive") {
    return interactiveScript
  }

  var scripts = head.getElementsByTagName("script")

  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i]
    if (script.readyState === "interactive") {
      interactiveScript = script
      return interactiveScript
    }
  }
}


var UA = navigator.userAgent

// `onload` event is supported in WebKit since 535.23
// ref: https://bugs.webkit.org/show_activity.cgi?id=38995
var isOldWebKit = Number(UA.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) < 536

// `onload/onerror` event is supported since Firefox 9.0
// ref:
//  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
//  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
var isOldFirefox = UA.indexOf("Firefox") > 0 &&
    !("onload" in doc.createElement("link"))


