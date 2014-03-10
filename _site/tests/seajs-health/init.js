define(function(require) {

  var test = require('../test')
  var xx100 = require('./xx/1.0.0/xx.js')
  var xx120 = require('./xx/1.2.0/xx.js')

  test.assert(xx100.name === 'xx', xx100.name)
  test.assert(xx120.name === 'xx', xx120.name)
  test.assert(xx100.version === '1.0.0', xx100.name)
  test.assert(xx120.version === '1.2.0', xx120.name)

  var a12 = require('./zz/a-1.2.js')
  var a13 = require('./zz/a-1.3.js')

  test.assert(a12.name === 'a', a12.name)
  test.assert(a13.name === 'a', a13.name)
  test.assert(a12.version === '1.2', a12.name)
  test.assert(a13.version === '1.3', a13.name)


  var data = seajs.health()
  var multiVersions = data.multiVersions
  var keys = []

  for (var key in multiVersions) {
    if (multiVersions.hasOwnProperty(key)) {
      keys.push(key)
    }
  }

  test.assert(keys.length === 2, keys.length)
  test.assert(keys[0].indexOf('/xx/{version}/xx.js') > 0, keys[0])
  test.assert(keys[1].indexOf('/zz/a-{version}.js') > 0, keys[1])

  test.assert(multiVersions[keys[0]].length === 2, multiVersions[keys[0]].length)
  test.assert(multiVersions[keys[0]][0].indexOf('/xx/1.0.0/xx.js') > 0, multiVersions[keys[0]][0])
  test.assert(multiVersions[keys[0]][1].indexOf('/xx/1.2.0/xx.js') > 0, multiVersions[keys[0]][1])

  test.assert(multiVersions[keys[1]].length === 2, multiVersions[keys[1]].length)
  test.assert(multiVersions[keys[1]][0].indexOf('/zz/a-1.2.js') > 0, multiVersions[keys[1]][0])
  test.assert(multiVersions[keys[1]][1].indexOf('/zz/a-1.3.js') > 0, multiVersions[keys[1]][1])


  test.next()

})
