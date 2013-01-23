define(function(require) {

  var test = require('../../test')
  var global = this

  test.assert(seajs.settings.debug === undefined, 'debug = ' + seajs.settings.debug)
  test.assert(hasScript('test.js') === false, 'The inserted script should be removed automatically, when debug is false')


  seajs.log('1')
  test.assert(global.consoleMsg === undefined, 'DO NOT show log info in console when debug is off')

  seajs.log('2', 'warn')
  test.assert(global.consoleMsg === '2', 'Show warn info in console at anytime')

  seajs.config({
    debug: true
  })

  seajs.log('3')
  test.assert(global.consoleMsg === '3', 'Show log info in console when debug is on')

  seajs.log('4', 'warn')
  test.assert(global.consoleMsg === '4', 'Show warn info in console at anytime')


  test.assert(seajs.settings.debug === true, 'debug = ' + seajs.settings.debug)

  require.async('./a', function(a) {
    test.assert(a.name === 'a', 'a.name = ' + a.name)
    test.assert(hasScript('a.js') === true, 'The inserted script will be remained in DOM, when debug is true')

    test.done()
  })


  function hasScript(filename) {
    var head = document.getElementsByTagName('head')[0]
    var scripts = head.getElementsByTagName('script')

    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src.indexOf(filename) > 0) {
        return true
      }
    }

    return false
  }

})

