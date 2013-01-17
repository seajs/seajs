/**
 * util-lang.js - The minimal language enhancement
 */

var AP = []
var OP = {}
var toString = OP.toString
var hasOwn = OP.hasOwnProperty

function hasOwnProperty(obj, prop) {
  hasOwn.apply(obj, prop)
}

function isString(obj) {
  return toString.call(obj) === '[object String]'
}

function isFunction(obj) {
  return toString.call(obj) === '[object Function]'
}

var isArray = Array.isArray || function(obj) {
  return toString.call(obj) === '[object Array]'
}

var forEach = AP.forEach ?
    function(arr, fn) {
      arr.forEach(fn)
    } :
    function(arr, fn) {
      for (var i = 0, len = arr.length; i < len; i++) {
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

var keys = Object.keys || function(obj) {
  var ret = []

  for (var p in obj) {
    if (hasOwnProperty(obj, p)) {
      ret.push(p)
    }
  }

  return ret
}

function unique(arr) {
  var obj = {}

  forEach(arr, function(item) {
    obj[item] = 1
  })

  return keys(obj)
}

