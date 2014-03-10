define(function(require) {

  var test = require('../test')

  var consoleMsgStack = global.consoleMsgStack
  var data = seajs.data
  var isNode = typeof process !== 'undefined'


  // basic cases
  require('./log.js')
  consoleMsgStack.length = 0


  test.assert(data.debug === undefined, 'debug = ' + data.debug)
  test.assert(isNode || hasScript('test.js') === false, 'The inserted script was removed automatically, when debug is off')


  seajs.log('1')
  test.assert(consoleMsgStack.pop() === undefined, 'DO NOT show log info in console when debug is off')

  seajs.log('2', 'warn')
  test.assert(consoleMsgStack.pop()[0] === '2', 'Show warn info in console at anytime')

  seajs.config({
    debug: true
  })

  seajs.log('3')
  test.assert(consoleMsgStack.pop()[0] === '3', 'Show log info in console when debug is on')

  seajs.log('4', 'warn')
  test.assert(consoleMsgStack.pop()[0] === '4', 'Show warn info in console at anytime')


  test.assert(data.debug === true, 'debug = ' + data.debug)

  require.async('./a', function(a) {
    test.assert(a.name === 'a', 'a.name = ' + a.name)
    test.assert(isNode || hasScript('a.js') === true, 'The inserted script is remained in DOM, when debug is true')

    test.next()
  })


  test.assert(seajs.log() === undefined, 'sea.log is NOT chainable')


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