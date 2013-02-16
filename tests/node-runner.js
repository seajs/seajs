/**
 * Run test specs in node environment
 * Usage:
 *   $ cd seajs
 *   $ node tests/runner-node.js
 */

require('../lib/sea')

define('node-runner')
seajs.use('./tests/test', function(test) {

  // Do NOT run the following suites in Node.js
  var excludes = [
    'specs/util'
  ]

  var testSuites = require('./meta').filter(function(item) {
    return excludes.indexOf('item') === -1
  })

  testSuites.forEach(function(suite) {
    var meta = require()
  })


  // go
  test.run(specs)

})

