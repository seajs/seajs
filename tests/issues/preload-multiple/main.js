define(function(require) {

  var test = require('../../test')
  var calendar = require('./calendar/calendar')

  test.assert(calendar.msg === '中文', calendar.msg)
  test.done()

})
