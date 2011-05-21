
/**
 * @fileoverview The minimal language enhancement.
 */

(function(util) {

  var toString = Object.prototype.toString;


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
      function(array, item) {
        return array.indexOf(item);
      } :
      function(array, item) {
        for (var i = 0, l = array.length; i < l; i++) {
          if (array[i] === item) {
            return i;
          }
        }
        return -1;
      };


  util.now = Date.now ? Date.now : function() {
    return new Date().getTime();
  };

})(seajs._util);
