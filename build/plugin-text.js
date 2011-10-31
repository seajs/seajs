
/**
 * @fileoverview The text plugin.
 */

define('plugin-text', ['plugin-base'], function(require) {

  var plugin = require('plugin-base');
  var util = plugin.util;


  plugin.add({
    name: 'text',

    ext: ['.tpl', '.htm', '.html'],

    load: function(url, callback) {
      util.xhr(url, function(data) {
        var str = jsEscape(data);
        util.globalEval('define("' + str + '")');
        callback();
      });
    }
  });


  function jsEscape(s) {
    return s.replace(/(["\\])/g, '\\$1')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t")
        .replace(/\f/g, "\\f");
  }

});
