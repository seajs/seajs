
/**
 * @fileoverview The web part for SeaJS Module Loader.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function(loader) {

  function scriptOnload(node, callback) {
    node.addEventListener('load', callback, false);
  }
  if (!document.createElement('script').addEventListener) {
    scriptOnload = function(node, callback) {
      var oldCallback = node.onreadystatechange;
      node.onreadystatechange = function() {
        var rs = node.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          node.onreadystatechange = null;
          oldCallback && oldCallback();
          callback.call(this);
        }
      };
    }
  }

  function getScript(url, success) {
    var node = document.createElement('script');
    var head = document.getElementsByTagName('head')[0];

    node.src = url;
    node.async = true;

    scriptOnload(node, function() {
      if(success) success.call(node);
      head.removeChild(node);
    });

    head.insertBefore(node, head.firstChild);
  }

  var scripts = document.getElementsByTagName('script');
  var loaderScript = scripts[scripts.length - 1];
  var src = loaderScript.src;
  var main = loaderScript.getAttribute('data-main');

  // exports
  loader.baseUrl = src.substring(0, src.lastIndexOf('/') + 1);
  loader.importModule = getScript;
  if (main) loader.main = new loader.Module(main);

})(S.ModuleLoader);
