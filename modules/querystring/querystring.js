
/**
 * @fileoverview This module provides utilities for dealing with query strings.
 * @author: lifesinger@gmail.com(Frank Wang)
 *
 * @see refs:
 *   - http://nodejs.org/docs/v0.4.7/api/querystring.html
 *   - http://developer.yahoo.com/yui/3/api/QueryString.html
 *   - https://github.com/kissyteam/kissy/blob/master/src/seed/web.js
 */

define(function(undef) {

  var querystring = {};

  var toString = Object.prototype.toString;
  var protoTrim = String.prototype.trim;

  var isArray = Array.isArray ? Array['isArray'] : function(val) {
    return toString.call(val) === '[object Array]';
  };
  var trim = protoTrim ?
      function(str) {
        return (str == undef) ? '' : protoTrim.call(str);
      } :
      function(str) {
        return (str == undef) ? '' : str.toString().replace(/^\s+|\s+$/g, '');
      };


  // The escape/unescape function used by querystring.stringify/parse,
  // provided so that it could be overridden if necessary.
  querystring.escape = encodeURIComponent;
  querystring.unescape = decodeURIComponent;


  /**
   * Serialize an object to a query string. Optionally override the default
   * separator and assignment characters.
   *
   * stringify({foo: 'bar'})
   *   // returns 'foo=bar'
   *
   * stringify({foo: 'bar', baz: 'bob'}, ';', ':')
   *   // returns 'foo:bar;baz:bob'
   */
  querystring.stringify = function(obj, sep, eq, arrayKey) {
    if (!isPlainObject(obj)) return '';

    sep = sep || '&';
    eq = eq || '=';
    arrayKey = arrayKey || false;

    var buf = [], key, val;

    for (key in obj) {
      val = obj[key];
      key = querystring.escape(key);

      // val is basic value
      if (isBasicValue(val)) {
        buf.push(key, eq, querystring.escape(val + ''), sep);
      }
      // val is not empty array
      else if (isArray(val) && val.length) {
        for (var i = 0, len = val.length; i < len; ++i) {
          if (isBasicValue(val[i])) {
            buf.push(
                key,
                (arrayKey ? '[]' : '') + eq,
                querystring.escape(val[i] + ''),
                sep);
          }
        }
      }
      // ignore other cases, including empty array, Function, RegExp, Date etc.
    }

    buf.pop();
    return buf.join('');
  };

  
  /**
   * Deserialize a query string to an object. Optionally override the default
   * separator and assignment characters.
   *
   * parse('a=b&b=c')
   *   // returns {a: 'b', b: 'c'}
   */
  querystring.parse = function(str, sep, eq) {
    var ret = {};

    if (typeof str !== 'string' || (str = trim(str)).length === 0) {
      return ret;
    }

    var pairs = str.split(sep || '&');

    for (var i = 0, len = pairs.length; i < len; ++i) {
      var pair = pairs[i].split(eq || '=');

      var key = querystring.unescape(pair[0]);
      var val = querystring.unescape(pair[1] || '');

      var m = key.match(/^(\w+)\[\]$/);
      if (m && m[1]) {
        key = m[1];
      }

      if (ret.hasOwnProperty(key)) {
        if (!isArray(ret[key])) {
          ret[key] = [ret[key]];
        }
        ret[key].push(val);
      }
      else {
        ret[key] = val;
      }
    }

    return ret;
  };


  /**
   * Checks to see if an object is a plain object (created using "{}" or
   * "new Object()" or "new FunctionClass()").
   */
  function isPlainObject(o) {
    /**
     * notes:
     * isPlainObject(node = document.getElementById("xx")) -> false
     * toString.call(node):
     *   ie678 === '[object Object]', other === '[object HTMLElement]'
     * 'isPrototypeOf' in node:
     *   ie678 === false, other === true
     */
    return o &&
        toString.call(o) === '[object Object]' &&
        'isPrototypeOf' in o;
  }


  /**
   * If the type of val is null, undefined, number, string, boolean,
   * return true.
   */
  function isBasicValue(val) {
    var t = typeof val;
    return val === null || (t !== 'object' && t !== 'function');
  }


  // exports
  querystring.version = '1.0.0';
  return querystring;

});
