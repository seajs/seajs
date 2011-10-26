
/**
 * @fileoverview The LESS plugin.
 */

define('plugin-less', function(require) {

  var less = require('less');
  var RP = require.constructor.prototype;


  // extend loader
  extendLESSResolve();
  extendLESSLoad();


  function extendLESSResolve() {
    var _resolve = RP.resolve;

    RP.resolve = function(id, context) {
      if (isLESS(id)) {
        id += '#';
      }
      return _resolve.call(this, id, context);
    };
  }


  function extendLESSLoad() {
    var _load = RP.load;

    RP.load = function(url, callback, charset) {

      if (isLESS(url)) {
        return less.Parser.importer(url, [], function(tree) {
          createCSS(tree.toCSS(), url.replace(/[^\w]/g, '_'));
          callback();
        }, {});
      }

      return _load(url, callback, charset);
    };
  }


  function isLESS(filepath) {
    return /\.less(?:$|\?)/.test(filepath);
  }


  function createCSS(cssText, id) {
    var elem = document.getElementById(id);
    if (elem) return;

    elem = document.createElement('style');
    elem.id = id;
    document.getElementsByTagName('head')[0].appendChild(elem);

    if (elem.styleSheet) { // IE
      elem.styleSheet.cssText = cssText;
    } else { // W3C
      elem.appendChild(document.createTextNode(cssText));
    }
  }

});
