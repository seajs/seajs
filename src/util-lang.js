/**
 * util-lang.js - The minimal language enhancement
 */

var hasOwnProperty = {}.hasOwnProperty

function hasOwn(obj, prop) {
  return hasOwnProperty.call(obj, prop)
}

function isFunction(obj) {
  return typeof obj === "function"
}

var isArray = Array.isArray || function(obj) {
  return obj instanceof Array
}

function unique(arr) {
  var obj = {}
  var ret = []

  for (var i = 0, len = arr.length; i < len; i++) {
    var item = arr[i]
    if (obj[item] !== 1) {
      obj[item] = 1
      ret.push(item)
    }
  }

  return ret
}


