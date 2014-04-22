/**
 * imitate module a -> module b
 * seajs.use(a) first time
 * when a is loaded and saved, a will request b
 * now seajs.use(a) second time
 */

seajs.config({
  base: '../'
})

define(function(require) {

  var test = require('../../../test')

  var count = 0

  function success() {
    if(++count == 2) {
     test.next()
    }
  }

  seajs.use('./multi-entry/a', function(a) {
    test.assert(a === 'b', 'module should return "b"')
    success()
  })
  seajs.on("request", function(data) {
    if(data.uri.indexOf("b.js") > -1) {
      seajs.use('./multi-entry/a', function(a) {
        test.assert(a === 'b', 'module should return "b"')
        success()
      })
    }
  })

});

