
/**
 * @fileoverview The minimal language enhancement.
 */

(function(util) {

  var toString = Object.prototype.toString;
  var AP = Array.prototype;


  util.isString = function(val) {
    return toString.call(val) === '[object String]';
  };


  util.isFunction = function(val) {
    return toString.call(val) === '[object Function]';
  };


  util.isArray = Array.isArray ? Array['isArray'] : function(val) {
    return toString.call(val) === '[object Array]';
  };


  util.indexOf = Array.prototype.indexOf ?
      function(arr, item) {
        return arr.indexOf(item);
      } :
      function(arr, item) {
        for (var i = 0, len = arr.length; i < len; i++) {
          if (arr[i] === item) {
            return i;
          }
        }
        return -1;
      };


  var forEach = util.each = function(arr, fn) {
    var val, i = 0, len = arr.length;
    for (val = arr[0];
         i < len && fn(val, i, arr) !== false;
         val = arr[++i]) {
    }
  };


  util.map = AP.map ?
      function(arr, fn) {
        return arr.map(fn);
      } :
      function(arr, fn) {
        var ret = [];
        forEach(arr, function(item, i, arr) {
          ret.push(fn(item, i, arr));
        });
        return ret;
      };


  util.filter = AP.filter ?
      function(arr, fn) {
        return arr.filter(fn);
      } :
      function(arr, fn) {
        var ret = [];
        forEach(arr, function(item, i, arr) {
          if (fn(item, i, arr)) {
            ret.push(item);
          }
        });
        return ret;
      };


  util.now = Date.now ? Date.now : function() {
    return new Date().getTime();
  };

})(seajs._util);
