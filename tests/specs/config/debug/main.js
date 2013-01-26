define(function(require) {

  var test = require('../../../test')
  var global = this
  var configData = seajs.config.data

  test.assert(configData.debug === undefined, 'debug = ' + configData.debug)
  test.assert(hasScript('test.js') === false, 'The inserted script was removed automatically, when debug is off')


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


  test.assert(configData.debug === true, 'debug = ' + configData.debug)

  require.async('./a', function(a) {
    test.assert(a.name === 'a', 'a.name = ' + a.name)
    test.assert(hasScript('a.js') === true, 'The inserted script is remained in DOM, when debug is true')

    test.next()
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

