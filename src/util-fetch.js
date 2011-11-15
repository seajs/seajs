
/**
 * @fileoverview Utilities for fetching js ans css files.
 */

(function(util, data) {

  var head = document.getElementsByTagName('head')[0];
  var isWebKit = ~navigator.userAgent.indexOf('AppleWebKit');


  util.getAsset = function(url, callback, charset) {
    var isCSS = /\.css(?:\?|$)/i.test(url);
    var node = document.createElement(isCSS ? 'link' : 'script');
    if (charset) node.setAttribute('charset', charset);

    assetOnload(node, function() {
      if (callback) callback.call(node);
      if (isCSS) return;

      // Don't remove inserted node when debug is on.
      if (!data.config.debug) {
        try {
          // Reduces memory leak.
          if (node.clearAttributes) {
            node.clearAttributes();
          } else {
            for (var p in node) delete node[p];
          }
        } catch (x) {
        }
        head.removeChild(node);
      }
    });

    if (isCSS) {
      node.rel = 'stylesheet';
      node.href = url;
      head.appendChild(node); // keep order
    }
    else {
      node.src = url;
      head.insertBefore(node, head.firstChild);
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
      cb.isCalled = true;
      callback();
      clearTimeout(timer);
    }
  }

  function scriptOnload(node, callback) {
    if (node.addEventListener) {
      node.addEventListener('load', callback, false);
      node.addEventListener('error', callback, false);
      // NOTICE: Nothing will happen in Opera when the file status is 404. In
      // this case, the callback will be called when time is out.
    }
    else { // for IE6-8
      node.attachEvent('onreadystatechange', fn);

      function fn() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          // ensure only call callback once.
          node.detachEvent('onreadystatechange', fn);
          callback();
        }
      }
    }
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
    // polling for Firefox, Chrome, Safari
    else {
      setTimeout(function() {
        poll(node, callback);
      }, 0); // for cache
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
        // place callback in here due to giving time to render.
        callback();
      } else {
        poll(node, callback);
      }
    }, 1);
  }


  var interactiveScript = null;

  util.getInteractiveScript = function() {
    if (interactiveScript && interactiveScript.readyState === 'interactive') {
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

    return null;
  };


  util.getScriptAbsoluteSrc = function(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4);
  };

})(seajs._util, seajs._data);

/**
 * references:
 *  - http://lifesinger.github.com/lab/2011/load-js-css/
 *  - ./test/issues/load-css/test.html
 */
