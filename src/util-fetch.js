/**
 * Utilities for fetching js and css files.
 */
;(function(util, config, global) {

  var doc = document
  var head = doc.head ||
      doc.getElementsByTagName('head')[0] ||
      doc.documentElement

  var baseElement = head.getElementsByTagName('base')[0]
  var isWebKit = navigator.userAgent.indexOf('AppleWebKit') > 0

  var IS_CSS_RE = /\.css(?:\?|$)/i
  var READY_STATE_RE = /loaded|complete|undefined/

  var currentlyAddingScript
  var interactiveScript


  util.fetch = function(url, callback, charset) {
    var isCSS = IS_CSS_RE.test(url)
    var node = document.createElement(isCSS ? 'link' : 'script')

    if (charset) {
      var cs = util.isFunction(charset) ? charset(url) : charset
      cs && (node.charset = cs)
    }

    assetOnload(node, callback || noop)

    if (isCSS) {
      node.rel = 'stylesheet'
      node.href = url
    }
    else {
      node.async = 'async'
      node.src = url
    }

    // For some cache cases in IE 6-9, the script executes IMMEDIATELY after
    // the end of the insertBefore execution, so use `currentlyAddingScript`
    // to hold current node, for deriving url in `define`.
    currentlyAddingScript = node

    // ref: #185 & http://dev.jquery.com/ticket/2709
    baseElement ?
        head.insertBefore(node, baseElement) :
        head.appendChild(node)

    currentlyAddingScript = null
  }

  function assetOnload(node, callback) {
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, callback)
    } else {
      styleOnload(node, callback)
    }
  }

  function scriptOnload(node, callback) {

    node.onload = node.onerror = node.onreadystatechange = function() {
      if (READY_STATE_RE.test(node.readyState)) {

        // Ensure only run once and handle memory leak in IE
        node.onload = node.onerror = node.onreadystatechange = null

        // Remove the script to reduce memory leak
        if (node.parentNode && !config.debug) {
          head.removeChild(node)
        }

        // Dereference the node
        node = undefined

        callback()
      }
    }

    // NOTICE:
    // Nothing will happen in Opera when the file status is 404. In this case,
    // the callback will be called when time is out.
  }

  function styleOnload(node, callback) {

    // for IE6-9 and Opera
    if (node.attachEvent || global.opera) {
      node.attachEvent('onload', callback)
      // NOTICE:
      // 1. "onload" will be fired in IE6-9 when the file is 404, but in
      //    this situation, Opera does nothing, so fallback to timeout.
      // 2. "onerror" doesn't fire in any browsers!
    }

    // Polling for Firefox, Chrome, Safari
    else {
      setTimeout(function() {
        poll(node, callback)
      }, 0) // Begin after node insertion
    }

  }

  function poll(node, callback) {
    if (callback.isCalled) {
      return
    }

    var isLoaded

    if (isWebKit) {
      if (node['sheet']) {
        isLoaded = true
      }
    }
    // for Firefox
    else if (node['sheet']) {
      try {
        if (node['sheet'].cssRules) {
          isLoaded = true
        }
      } catch (ex) {
        if (ex.name === 'SecurityError' || // firefox >= 13.0
            ex.name === 'NS_ERROR_DOM_SECURITY_ERR') { // old firefox
          isLoaded = true
        }
      }
    }

    setTimeout(function() {
      if (isLoaded) {
        // Place callback in here due to giving time for style rendering.
        callback()
      } else {
        poll(node, callback)
      }
    }, 1)
  }

  function noop() {
  }


  util.getCurrentScript = function() {
    if (currentlyAddingScript) {
      return currentlyAddingScript
    }

    // For IE6-9 browsers, the script onload event may not fire right
    // after the the script is evaluated. Kris Zyp found that it
    // could query the script nodes and the one that is in "interactive"
    // mode indicates the current script.
    // Ref: http://goo.gl/JHfFW
    if (interactiveScript &&
        interactiveScript.readyState === 'interactive') {
      return interactiveScript
    }

    var scripts = head.getElementsByTagName('script')

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i]
      if (script.readyState === 'interactive') {
        interactiveScript = script
        return script
      }
    }
  }

  util.getScriptAbsoluteSrc = function(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4)
  }


  util.importStyle = function(cssText, id) {
    // Don't add multi times
    if (id && doc.getElementById(id)) return

    var element = doc.createElement('style')
    id && (element.id = id)

    // Adds to DOM first to avoid the css hack invalid
    head.appendChild(element)

    // IE
    if (element.styleSheet) {
      element.styleSheet.cssText = cssText
    }
    // W3C
    else {
      element.appendChild(doc.createTextNode(cssText))
    }
  }


  /**
   * References:
   *  - http://unixpapa.com/js/dyna.html
   *  - ../test/research/load-js-css/test.html
   *  - ../test/issues/load-css/test.html
   *  - http://www.blaze.io/technical/ies-premature-execution-problem/
   */

})(seajs._util, seajs._config, this)

