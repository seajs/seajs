
/**
 * @fileoverview The base utilities for plugin development.
 */

define('plugin-base', [], function(require, exports) {

  var RP = require.constructor.prototype;
  var meta = {};


  exports.add = function(o) {
    meta[o.name] = o;
  };


  exports.util = {
    xhr: xhr,
    globalEval: globalEval
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
            if (meta.hasOwnProperty(name) &&
                ~meta[name].ext.join('|').indexOf(e)) {
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


  function xhr(url, callback) {
    var r = new (window.ActiveXObject || XMLHttpRequest)('Microsoft.XMLHTTP');
    r.open('GET', url, true);

    r.onreadystatechange = function() {
      if (r.readyState === 4) {
        if (r.status === 200) {
          callback(r.responseText);
        }
        else {
          throw 'Could not load: ' + url + ', status = ' + r.status;
        }
      }
    };

    return r.send(null);
  }


  function globalEval(data) {
    if (data && /\S/.test(data)) {
      ( window.execScript || function(data) {
        window['eval'].call(window, data);
      } )(data);
    }
  }

});
