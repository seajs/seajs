/**
 * @fileoverview Provides a custom "console" to the environment.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function(global) {

  if (!global['console']) {

    // var t = []; for(var p in console) t.push(p); t;
    var members = ['log', 'debug', 'info', 'warn', 'exception', 'assert', 'dir',
      'dirxml', 'trace', 'group', 'groupEnd', 'groupCollapsed', 'time',
      'timeEnd', 'profile', 'profileEnd', 'count', 'clear', 'table', 'error',
      'notifyFirebug', 'firebug', 'userObjects'];

    var console = {};
    for (var i = 0, len = members.length; i < len; i++) {
      console[members[i]] = function() {
      }
    }

    global['console'] = console;
  }

})(this);
