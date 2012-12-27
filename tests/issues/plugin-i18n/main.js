define(function(require) {

  var test = require('../../test')

  var Calendar = require('./calendar')
  var cal = new Calendar()

  test.assert(cal.msg === '消息', Calendar.msg)
  test.done()

})
