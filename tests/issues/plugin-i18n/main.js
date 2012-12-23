define(function(require) {

  var test = require('../../test')

  var Calendar = require('./calendar')
  var lang = require('./calendar/i18n/zh-cn/lang')

  var cal = new Calendar({
    lang: lang
  })

  test.assert(cal.msg === '消息', Calendar.msg)
  test.done()

})
