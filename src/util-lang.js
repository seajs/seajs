/**
 * util-lang.js - The minimal language enhancement
 */

var _object = {}

function isType(type) {
  return function(obj) {
    return _object.toString.call(obj) == "[object " + type + "]"
  }
}

var isObject = isType("Object")
var isString = isType("String")
var isArray = Array.isArray || isType("Array")
var isFunction = isType("Function")

var _cid = 0
function cid() {
  return _cid++
}
