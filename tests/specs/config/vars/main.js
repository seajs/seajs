
seajs.config({
  vars: {
    'mod_a': 'a.js',
    'b/c': 'path/to/bb/cc',
    'brace': '{brace_in_value}',
    'locale': 'zh-cn'
  }
})


define(function(require) {

  var test = require('../../../test')


  var uri = require.resolve('./path/to/{mod_a}')
  test.assert(uri.indexOf('path/to/a.js') > 0, uri)

  uri = require.resolve('{b/c}/d.js')
  test.assert(uri.indexOf('path/to/bb/cc/d.js') > 0, uri)

  uri = require.resolve('./path/to/{brace}')
  test.assert(uri.indexOf('{brace_in_value}') > 0, uri)

  uri = require.resolve('./path/to/{not-existed}')
  test.assert(uri.indexOf('/path/to/{not-existed}') > 0, uri)


  // i18n
  var Calendar = require('./calendar/calendar')
  var cal = new Calendar()
  test.assert(cal.msg === '语言包支持', cal.msg)


  test.next()

})

