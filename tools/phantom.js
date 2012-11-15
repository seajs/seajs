var page = require('webpage').create()

page.onConsoleMessage = function(msg) {
  console.log(msg)

  if (msg === '[END]') {
    var result = page.evaluate(function() {
      return result
    })

    if (result.error.count + result.fail.count) {
      phantom.exit(1)
    } else {
      phantom.exit(0)
    }
  }
}


var system = require('system')
var address = system.args[1]

page.open(address, function(status) {
  if (status !== 'success') {
    console.log('FAIL to load this address: ' + address)
  }
})
