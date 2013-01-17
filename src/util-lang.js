/**
 * The minimal language enhancement
 */

var toString = Object.prototype.toString
var AP = Array.prototype


function isString(val) {
  return toString.call(val) === '[object String]'
}


function isFunction(val) {
  return toString.call(val) === '[object Function]'
}


var isArray = Array.isArray || function(val) {
  return toString.call(val) === '[object Array]'
}


var forEach = AP.forEach ?
    function(arr, fn) {
      arr.forEach(fn)
    } :
    function(arr, fn) {
      for (var i = 0; i < arr.length; i++) {
        fn(arr[i], i, arr)
      }
    }


var map = AP.map ?
    function(arr, fn) {
      return arr.map(fn)
    } :
    function(arr, fn) {
      var ret = []
      forEach(arr, function(item, i, arr) {
        ret.push(fn(item, i, arr))
      })
      return ret
    }


var filter = AP.filter ?
    function(arr, fn) {
      return arr.filter(fn)
    } :
    function(arr, fn) {
      var ret = []
      forEach(arr, function(item, i, arr) {
        if (fn(item, i, arr)) {
          ret.push(item)
        }
      })
      return ret
    }


var keys = Object.keys || function(o) {
  var ret = []

  for (var p in o) {
    if (o.hasOwnProperty(p)) {
      ret.push(p)
    }
  }

  return ret
}


var unique = function(arr) {
  var o = {}

  forEach(arr, function(item) {
    o[item] = 1
  })

  return keys(o)
}

