
/**
 * @fileoverview DOM utils for fetching script etc.
 */

(function(util, data) {

  var head = document.getElementsByTagName('head')[0];

  util.getAsset = function(url, callback, charset) {
    var isCSS = /\.css(?:\?|$)/i.test(url);
    var node = document.createElement(isCSS ? 'link' : 'script');

    assetOnload(node, function() {
      if (callback) callback.call(node);
      if (isCSS) return;

      // Reduces memory leak.
      try {
        if (node.clearAttributes) {
          node.clearAttributes();
        } else {
          for (var p in node) delete node[p];
        }
      } catch (x) {
      }
      head.removeChild(node);
    });

    if (isCSS) {
      node.rel = 'stylesheet';
      node.href = url;
    }
    else {
      node.async = true;
      node.src = url;
    }
    if (charset) node.setAttribute('charset', charset);

    return head.insertBefore(node, head.firstChild);
  };

  function assetOnload(node, callback) {
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, cb);
    } else {
      styleOnload(node, cb);
    }

    var timer = setTimeout(function() {
      cb();
      util.error({
        message: 'time is out',
        from: 'getAsset',
        type: 'warn'
      });
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
      node.attachEvent('onreadystatechange', function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          callback();
        }
      });
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
    // polling for Chrome and Safari
    else if (window['devicePixelRatio']) {
      setTimeout(function() {
        poll(node, callback);
      }, 0); // for cache
    }
    // call immediately in Firefox
    else {
      callback();
    }
  }

  function poll(node, callback) {
    if (callback.isCalled) {
      return;
    }

    // ref: http://yearofmoo.com/2011/03/cross-browser-stylesheet-preloading/
    var stylesheets = document.styleSheets;
    for (var i = 0; i < stylesheets.length; i++) {
      if (stylesheets[i]['ownerNode'] === node) {
        callback();
        return;
      }
    }

    setTimeout(function() {
      poll(node, callback);
    }, 15);
  }

  util.assetOnload = assetOnload;


  var interactiveScript = null;

  util.getInteractiveScript = function() {
    if (interactiveScript && interactiveScript.readyState === 'interactive') {
      return interactiveScript;
    }

    var scripts = head.getElementsByTagName('script');

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      if (script.readyState === 'interactive') {
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
 *  - http://lifesinger.org/lab/2011/load-js-css/
 *  - ./test/issues/load-css/test.html
 */
