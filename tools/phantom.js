var page = require('webpage').create()

page.onConsoleMessage = function(arg) {
  var parts = arg.split('`')
  var type = parts[0]
  var msg = parts[1] || '[LOG] ' + arg

  console.log(color(msg, type))

  // Exit on fail
  if (type === 'fail' || type === 'error') {
    phantom.exit(1)
  }

  if (msg === 'END') {
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
    console.log(color('FAIL to load this address: ' + address, fail))
  }
})


// https://github.com/loopj/commonjs-ansi-color/blob/master/lib/ansi-color.js
var ANSI_CODES = {
  'fail': 31, // red
  'error': 31, // red
  'pass': 32, // green
  'info': 37 // white
}

function color(str, type) {
  return '\033[' +
      (ANSI_CODES[type] || ANSI_CODES['info']) + 'm  '
      + str + '\033[0m'
}