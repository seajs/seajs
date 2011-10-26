
/**
 * @fileoverview The text plugin.
 */

define('plugin-text', ['plugin-base'], function(require) {

  var plugin = require('plugin-base');


  plugin.add({
    name: 'text',

    ext: ['.tpl', '.htm', '.html', '.json', '#text'],

    load: function(url, callback) {
      return xhr(url, callback);
    }
  });


  function xhr(url, callback) {
    var r = new (window.ActiveXObject || XMLHttpRequest)('Microsoft.XMLHTTP');
    r.open('GET', url, true);

    r.onreadystatechange = function() {
      if (r.readyState === 4) {
        if (r.status === 200) {
          var str = jsEscape(r.responseText);
          var code = 'define("' + url + '#text##", [], "' + str + '")';
          globalEval(code);

        }
        else {
          throw 'Could not load ' + url;
        }
        callback();
      }
    };
    return r.send(null);
  }


  function jsEscape(s) {
    return s.replace(/(["\\])/g, '\\$1')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t")
        .replace(/\f/g, "\\f");
  }


  function globalEval(data) {
    if (data && /\S/.test(data)) {
      ( window.execScript || function(data) {
        window['eval'].call(window, data);
      } )(data);
    }
  }

});
