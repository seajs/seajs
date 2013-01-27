define(function(require) {

  var test = require('../../../test')
  var extend = require('./extend')

  var a = require('./a')
  test.assert(a.filename.indexOf('a.js') === 0, 'a.filename = ' + a.filename)

  extend.destroy()
  test.next()

});

