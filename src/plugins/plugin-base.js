
/**
 * @fileoverview The base utilities for plugin development.
 */

define('plugin-base', [], function(require) {

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

      var q = id.replace(/.*?(\?.*)?$/, '$1');
      var s = id.replace(q, ''); // strip ?xx
      var e = s.replace(/.*((?:\.|#).*)$/, '$1'); // get .xxx or #xxx

      if (e !== s) {
        for (var name in meta) {
          if ( ~meta[name].ext.join('|').indexOf(e)) {
            // name#xxx -> name#
            if (e.charAt(0) === '#') {
              s = s.replace(e, '#');
            }
            // name.xxx -> name.xxx#
            else {
              s += '#';
            }

            s += '#`' + name + '`#';
            id = s + q;
            break;
          }
        }
      }

      return _resolve.call(this, id, context);
    };
  }


  function extendLoad() {
    var _load = RP.load;

    RP.load = function(url, callback, charset) {
      var m = url.match(/^.*(?:#`(\w+)`#).*$/);
      var name;
      if (m) name = m[1];

      if (name && meta[name]) {
        url = url.replace('#`' + name + '`#', '');
        return meta[name].load(url, callback);
      }

      return _load(url, callback, charset);
    };
  }

});
