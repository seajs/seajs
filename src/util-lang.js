/**
 * util-lang.js - The minimal language enhancement
 */

function isType(type) {
  return function(obj) {
    return {}.toString.call(obj) == "[object " + type + "]"
  }
}

var isObject = isType("Object")
var isString = isType("String")
var isArray = Array.isArray || isType("Array")
var isFunction = isType("Function")
function printError(msg) {
  if (data.debug && global.console && console.warn) {
    console.warn(msg)
  }
}

var _cid = 0
function cid() {
  return _cid++
}

