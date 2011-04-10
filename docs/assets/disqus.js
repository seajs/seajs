/**
 * DISQUS module for seajs.com
 */

module.declare(function(require, exports, module) {

  exports.init = function() {

    var SEAJS = 'seajs';

    if(location.host.indexOf(SEAJS) === -1) {
      return;
    }

    
    // create thread element
    var thread = document.createElement('div');
    thread.id = 'disqus_thread';
    var content = document.getElementById('content');
    var copyright = document.getElementById('copyright');
    content.insertBefore(thread, copyright);

    // configuration variables
    window.disqus_shortname = SEAJS;
    //window.disqus_developer = 1;
    window.disqus_identifier = location.pathname;
    window.disqus_url = location.protocol + '//' + location.host +
        location.pathname;

    // load it
    module.load('http://' + disqus_shortname + '.disqus.com/embed.js');

  };

});
