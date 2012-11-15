var page = new WebPage()
var address = phantom.args[0]

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

page.open(address, function(status) {
  if (status !== 'success') {
    console.warn('** status = ' + status)
  }
})
