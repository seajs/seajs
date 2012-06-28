
// Old Safari 和 Firefox 在 script 404 时会抛错
if (typeof window !== 'undefined') {
  window.onerror = function() {
    if (typeof console !== 'undefined') {
      console.log('Ignore script loading error')
    }
  }
}

define(function(require) {

  var test = require('../../test')

  try {
    var bogus = require('bogus')
  }
  catch (ex) { // for node
    bogus = null
  }

  test.assert(bogus === null, 'return null when module missing')
  test.done()

})
