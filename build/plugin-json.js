
/**
 * @fileoverview The json plugin.
 */

define('plugin-json', ['plugin-base'], function(require) {

  var plugin = require('plugin-base');
  var util = plugin.util;


  plugin.add({
    name: 'json',

    ext: ['.json', '#json'],

    load: function(url, callback) {
      util.xhr(url, function(code) {
        util.globalEval('define("' + url + '#json##", [], ' + code + ')');
        callback();
      });
    }
  });

});
