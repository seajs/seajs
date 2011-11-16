
/**
 * @fileoverview Utilities for fetching js ans css files.
 */

(function(util, data) {

  var head = document.head ||
      document.getElementsByTagName('head')[0] ||
      document.documentElement;

  var UA = navigator.userAgent;
  var isWebKit = ~UA.indexOf('AppleWebKit');


  util.getAsset = function(url, callback, charset) {
    var isCSS = /\.css(?:\?|$)/i.test(url);
    var node = document.createElement(isCSS ? 'link' : 'script');

    if (charset) {
      node.charset = charset;
    }

    assetOnload(node, callback);

    if (isCSS) {
      node.rel = 'stylesheet';
      node.href = url;
      head.appendChild(node); // Keep style cascading order
    }
    else {
      node.async = 'async';
      node.src = url;

      //For some cache cases in IE 6-8, the script executes before the end
      //of the appendChild execution, so to tie an anonymous define
      //call to the module name (which is stored on the node), hold on
      //to a reference to this node, but clear after the DOM insertion.
      currentlyAddingScript = node;
      head.insertBefore(node, head.firstChild);
      currentlyAddingScript = null;
    }

    return node;
  };

  function assetOnload(node, callback) {
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, cb);
    } else {
      styleOnload(node, cb);
    }

    var timer = setTimeout(function() {
      util.warn('time is out:', node.src);
      cb();
    }, data.config.timeout);

    function cb() {
      if (!cb.isCalled) {
        cb.isCalled = true;
        clearTimeout(timer);

        callback();
      }
    }
  }

  function scriptOnload(node, callback) {

    node.onload = node.onerror = node.onreadystatechange =
        function(_, isAbort) {

          if (isAbort || !node.readyState ||
              /loaded|complete/.test(node.readyState)) {

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
              head.removeChild(node);
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
    if (node.attachEvent) {
      node.attachEvent('onload', callback);
      // NOTICE:
      // 1. "onload" will be fired in IE6-9 when the file is 404, but in
      // this situation, Opera does nothing, so fallback to timeout.
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
        // NS_ERROR_DOM_SECURITY_ERR
        if (ex.code === 1000) {
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


  util.isOpera = ~UA.indexOf('Opera');

})(seajs._util, seajs._data);

/**
 * references:
 *  - http://unixpapa.com/js/dyna.html
 *  - ../test/research/load-js-css/test.html
 *  - ../test/issues/load-css/test.html
 */
