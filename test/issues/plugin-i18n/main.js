define(function(require) {

  var test = require('../../test')

  var Calendar = require('./calendar')
  test.assert(Calendar.msg === '消息', Calendar.msg)

  test.done()

})
