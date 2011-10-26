
/**
 * @fileoverview The base utilities for plugin development.
 */

define('plugin-base', [], function(require, exports) {

  var RP = require.constructor.prototype;
  var meta = {};


  exports.add = function(o) {
    meta[o.name] = o;
  };


  extendResolve();
  extendLoad();


  function extendResolve() {
    var _resolve = RP.resolve;

    RP.resolve = function(id, context) {
      if (/(?:\.|#)\w/.test(id)) {

        var q = id.replace(/.*?(\?.*)?$/, '$1');
        var s = id.replace(q, ''); // strip ?xx
        var e = s.replace(/.*((?:\.|#)\w+)$/, '$1'); // get .xxx or #xxx

        if (e !== s) {
          for (var name in meta) {
            if (~meta[name].ext.join('|').indexOf(e)) {
              // a#xxx -> a#xxx##
              if (e.charAt(0) === '#') {
                s += '##';
              }
              // a.xxx -> a.xxx#name##
              else {
                s += '#' + name + '##';
              }

              id = s + q;
              break;
            }
          }
        }
      }

      return _resolve.call(this, id, context);
    };
  }


  function extendLoad() {
    var _load = RP.load;

    RP.load = function(url, callback, charset) {
      var m = url.match(/^.*(?:#(\w+)#).*$/);
      var name;
      if (m) name = m[1];

      if (name && meta[name]) {
        url = url.replace('#' + name + '#', '');
        return meta[name].load(url, callback);
      }

      return _load(url, callback, charset);
    };
  }

});
