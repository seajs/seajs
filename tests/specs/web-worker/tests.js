define('a', [], function() { return 'a' })
define('b', ['c'], function(require) { var c = require('c'); return c })
define('c', [], {})
define('e', [], function(require, exports, module) {
  module.exports = 'e'
  console.log('huh?')
})

define(function(require) {
  function assert(value, message) {
    self.postMessage({message: message, result: value});
  }
  console.log("Start runner in worker")
  self.addEventListener('message', function (e) {
    console.log("On message: " + e.data);
    if (e.data === 'start') {
      console.log("Start running tests");
      var a = require('a');
      assert(a === 'a', 'a is a');

      var b = require('b')
      assert(JSON.stringify(b) == '{}', 'b is {}')

      var c = require('c')
      assert(JSON.stringify(c) == '{}', 'c is {}')

      assert(b === c, 'b returns c')


      var e = require('e')
      assert(e === 'e', 'e is e')
    }
  })
})
