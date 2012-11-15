var page = new WebPage();
var address = phantom.args[0];

page.onConsoleMessage = function(msg) {
  console.log(msg)
  if (msg === 'Test finished') {
    var result = page.evaluate(function() {
      return result;
    });
    console.log('pass: ' + result.pass.count)
    console.log('warn: ' + result.warn.count)
    console.log('error: ' + result.error.count)
    console.log('fail: ' + result.fail.count)

    if (result.error.count) {
      phantom.exit(1)
    } else if(result.fail.count) {
      phantom.exit(1)
    } else {
      phantom.exit(0)
    }
  }
};

page.open(address, function(status) {
  if (status !== 'success') {
    console.log('can\'t load the address!');
  }
});
