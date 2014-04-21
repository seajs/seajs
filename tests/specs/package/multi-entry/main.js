
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

  seajs.use('./multi-entry/a', success)
  seajs.on("fetch", function(mod) {
    if(mod.uri.indexOf("b.js") > -1) {
      seajs.use('./multi-entry/a', success)
    }
  })

});

