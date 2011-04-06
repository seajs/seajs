/**
 * DISQUS module for seajs.com
 */

module.declare(function(require, exports, module) {

  // create thread element
  var thread = document.createElement('div');
  thread.id = 'disqus_thread';
  var content = document.getElementById('content');
  var copyright = document.getElementById('copyright');
  content.insertBefore(thread, copyright);

  // configuration variables
  window.disqus_shortname = 'seajs';
  window.disqus_developer = 1;
  window.disqus_identifier = location.pathname;
  window.disqus_url = location.protocol + '//' + location.pathname;

  // load it
  //module.load('http://' + disqus_shortname + '.disqus.com/embed');

  /* * * DON'T EDIT BELOW THIS LINE * * */
  var dsq = document.createElement('script');
  dsq.async = true;
  dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
  document.getElementsByTagName('head')[0].appendChild(dsq);
});
