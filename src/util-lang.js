/**
 * util-lang.js - The minimal language enhancement
 */

var emptyArr = []
var emptyObj = {}
var toString = emptyObj.toString
var hasOwnProperty = emptyObj.hasOwnProperty
var slice = emptyArr.slice

function hasOwn(obj, prop) {
  return hasOwnProperty.call(obj, prop)
}

function isFunction(obj) {
  return toString.call(obj) === "[object Function]"
}

var isArray = Array.isArray || function(obj) {
  return toString.call(obj) === "[object Array]"
}

var forEach = emptyArr.forEach ?
    function(arr, fn) {
      arr.forEach(fn)
    } :
    function(arr, fn) {
      for (var i = 0, len = arr.length; i < len; i++) {
        fn(arr[i], i, arr)
      }
    }

var keys = Object.keys || function(obj) {
  var ret = []

  for (var p in obj) {
    if (hasOwn(obj, p)) {
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


