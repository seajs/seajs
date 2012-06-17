/**
 * @fileoverview Utilities for fetching js and css files.
 */

(function(util, data, global) {

  var config = data.config;

  var head = document.head ||
      document.getElementsByTagName('head')[0] ||
      document.documentElement;
  var baseElement = head.getElementsByTagName('base')[0];

  var UA = navigator.userAgent;
  var isWebKit = UA.indexOf('AppleWebKit') > 0;

  var IS_CSS_RE = /\.css(?:\?|$)/i;
  var READY_STATE_RE = /loaded|complete|undefined/;


  util.getAsset = function(url, callback, charset) {
    var isCSS = IS_CSS_RE.test(url);
    var node = document.createElement(isCSS ? 'link' : 'script');

    if (charset) {
      var cs = util.isFunction(charset) ? charset(url) : charset;
      if (cs) {
        node.charset = cs;
      }
    }

    assetOnload(node, callback);

    if (isCSS) {
      node.rel = 'stylesheet';
      node.href = url;
    }
    else {
      node.async = 'async';
      node.src = url;
    }

    // For some cache cases in IE 6-9, the script executes IMMEDIATELY after
    // the end of the insertBefore execution, so use `currentlyAddingScript`
    // to hold current node, for deriving url in `define`.
    currentlyAddingScript = node;

    // ref: #185 & http://dev.jquery.com/ticket/2709
    baseElement ?
        head.insertBefore(node, baseElement) :
        head.appendChild(node);

    currentlyAddingScript = null;
  };

  function assetOnload(node, callback) {
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, cb);
    } else {
      styleOnload(node, cb);
    }

    var timer = setTimeout(function() {
      util.log('Time is out:', node.src);
      cb();
    }, config.timeout);

    function cb() {
      if (!cb.isCalled) {
        cb.isCalled = true;
        clearTimeout(timer);
        callback();
      }
    }
  }

  function scriptOnload(node, callback) {

    node.onload = node.onerror = node.onreadystatechange = function() {
      if (READY_STATE_RE.test(node.readyState)) {

        // Ensure only run once
        node.onload = node.onerror = node.onreadystatechange = null;

        // Reduce memory leak
        if (node.parentNode) {
          try {
            if (node.clearAttributes) {
              node.clearAttributes();
            }
            else {
              for (var p in node) delete node[p];
            }
          } catch (x) {
          }

          // Remove the script
          if (!config.debug) {
            head.removeChild(node);
          }
        }

        // Dereference the node
        node = undefined;

        callback();
      }
    };

    // NOTICE:
    // Nothing will happen in Opera when the file status is 404. In this case,
    // the callback will be called when time is out.
  }

  function styleOnload(node, callback) {

    // for IE6-9 and Opera
    if (global.hasOwnProperty('attachEvent')) { // see #208
      node.attachEvent('onload', callback);
      // NOTICE:
      // 1. "onload" will be fired in IE6-9 when the file is 404, but in
      //    this situation, Opera does nothing, so fallback to timeout.
      // 2. "onerror" doesn't fire in any browsers!
    }

    // Polling for Firefox, Chrome, Safari
    else {
      setTimeout(function() {
        poll(node, callback);
      }, 0); // Begin after node insertion
    }

  }

  function poll(node, callback) {
    if (callback.isCalled) {
      return;
    }

    var isLoaded;

    if (isWebKit) {
      if (node['sheet']) {
        isLoaded = true;
      }
    }
    // for Firefox
    else if (node['sheet']) {
      try {
        if (node['sheet'].cssRules) {
          isLoaded = true;
        }
      } catch (ex) {
        if (ex.name === 'SecurityError' || // firefox >= 13.0
            ex.name === 'NS_ERROR_DOM_SECURITY_ERR') { // old firefox
          isLoaded = true;
        }
      }
    }

    setTimeout(function() {
      if (isLoaded) {
        // Place callback in here due to giving time for style rendering.
        callback();
      } else {
        poll(node, callback);
      }
    }, 1);
  }


  var currentlyAddingScript;
  var interactiveScript;

  util.getCurrentScript = function() {
    if (currentlyAddingScript) {
      return currentlyAddingScript;
    }

    // For IE6-9 browsers, the script onload event may not fire right
    // after the the script is evaluated. Kris Zyp found that it
    // could query the script nodes and the one that is in "interactive"
    // mode indicates the current script.
    // Ref: http://goo.gl/JHfFW
    if (interactiveScript &&
        interactiveScript.readyState === 'interactive') {
      return interactiveScript;
    }

    var scripts = head.getElementsByTagName('script');

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      if (script.readyState === 'interactive') {
        interactiveScript = script;
        return script;
      }
    }
  };


  util.getScriptAbsoluteSrc = function(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4);
  };

})(seajs._util, seajs._data, this);

/**
 * References:
 *  - http://unixpapa.com/js/dyna.html
 *  - ../test/research/load-js-css/test.html
 *  - ../test/issues/load-css/test.html
 *  - http://www.blaze.io/technical/ies-premature-execution-problem/
 */
