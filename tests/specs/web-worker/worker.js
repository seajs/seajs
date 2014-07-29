console.log("Worker Up!")
console.log(location)
importScripts("../../../dist/sea.js");

define('a', [], function() { return 'a' })
define('b', ['c'], function(require) { var c = require('c'); return c })
define('c', [], {})
define('e', [], function(require, exports, module) {
  module.exports = 'e'
  console.log('huh?')
})

seajs.use("./tests");
