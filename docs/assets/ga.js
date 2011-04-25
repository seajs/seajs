/**
 * GA module for seajs.com
 */

define(function(require, exports, module) {

  var global = this;

  exports.init = function() {
    var _gaq = [];
    _gaq.push(['_setAccount', 'UA-53409-10']);
    _gaq.push(['_trackPageview']);
    global._gaq = _gaq;

    var src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    module.load(src);
  };

});
