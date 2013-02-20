
seajs.on('compiled', function(mod) {
  if (mod.uri.indexOf('/modify/a.js') > 0) {
    mod.exports.name = 'a'
  }
  else if (mod.uri.indexOf('/modify/b.js') > 0) {
    mod.exports.name = 'b'

    mod.exports.getName = function() {
      return this.name
    }
  }
})


define(function(require) {

  var test = require('../../../test')
  var a = require('./a')
  var b = require('./b')

  a.getName = function() {
    return this.name
  }

  test.assert(a.name === 'a', a.name)
  test.assert(a.getName() === 'a', a.getName())

  test.assert(b.name === 'b', b.name)
  test.assert(b.getName() === 'b', b.getName())

  test.next()

});

