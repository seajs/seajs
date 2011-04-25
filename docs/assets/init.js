/**
 * init module for seajs.com
 */

define(function(require) {

  require('./disqus').init();
  require('./highlight').init();
  require('./ga').init();

});
