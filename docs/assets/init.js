/**
 * init module for seajs.com
 */

module.declare(function(require) {

  require('./disqus').init();
  require('./highlight').init();

});
