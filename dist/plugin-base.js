
/**
 * @fileoverview The base utilities for plugin development.
 */

define('plugin-base', [], function(require, exports) {

  var util = seajs.pluginSDK.util;
  var RP = require.constructor.prototype;
  var meta = {};
  var cache = {};


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
      if (util.isArray(id)) {
        return _resolve(id, context);
      }

      var flag;

      if (/\.\w|^\w+!/.test(id)) {
        var m;

        // id = text!path/to/some
        if ((m = id.match(/^(\w+)!(.*)$/))) {
          flag = m[1];
          id = m[2];
        }

        // id = abc.xyz?t=123
        else if ((m = id.match(/[^?]*(\.\w+)/))) {
          var ext = m[1];
          for (var type in meta) {
            if (meta.hasOwnProperty(type) &&
                ~meta[type].ext.join('|').indexOf(ext)) {
              flag = type;
              break;
            }
          }
        }

        // don't add .js
        if (flag && !/\?|#$/.test(id)) {
          id += '#';
        }
      }

      var uri = _resolve.call(this, id, context);

      if (flag && meta[flag] && !cache[uri]) {
        cache[uri] = flag;
      }
      return uri;
    };
  }


  function extendLoad() {
    var _load = RP.load;

    RP.load = function(url, callback, charset) {
      var type = cache[util.unParseMap(url)];
      if (type) {
        meta[type].load(url, callback);
      }
      else {
        _load(url, callback, charset);
      }
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
