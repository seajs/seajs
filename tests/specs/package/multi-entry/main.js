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
    if(++count == 10) {
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

  // clone a and b, append a new use
  seajs.use('./multi-entry/a1', function(a) {
    test.assert(a === 'b', 'module should return "b"')
    success()
  })
  seajs.on("request", function(data) {
    if(data.uri.indexOf("b1.js") > -1) {
      seajs.use('./multi-entry/a1', function(a) {
        test.assert(a === 'b', 'module should return "b"')
        success()
      })
    }
  })
  seajs.use('./multi-entry/a1', function(a) {
    test.assert(a === 'b', 'module should return "b"')
    success()
  })

  // c -> d -> e
  seajs.use('./multi-entry/c', function(c) {
    test.assert(c === 'e', 'module should return "e"')
    success()
  })
  seajs.on("request", function(data) {
    if(data.uri.indexOf("d.js") > -1) {
      seajs.use('./multi-entry/c', function(c) {
        test.assert(c === 'e', 'module should return "e"')
        success()
      })
    }
  })

  // clone c d e, append a new use
  seajs.use('./multi-entry/c1', function(c) {
    test.assert(c === 'e', 'module should return "e"')
    success()
  })
  seajs.on("request", function(data) {
    if(data.uri.indexOf("d1.js") > -1) {
      seajs.use('./multi-entry/c1', function(c) {
        test.assert(c === 'e', 'module should return "e"')
        success()
      })
    }
  })
  seajs.use('./multi-entry/c1', function(c) {
    test.assert(c === 'e', 'module should return "e"')
    success()
  })

});

