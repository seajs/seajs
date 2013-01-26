
seajs.config({
  vars: {
    'locale': 'zh-cn',
    'xx': '{brace_in_value}'
  }
})


define(function(require) {

  var test = require('../../../test')

  var lang = require('./i18n/{locale}')
  test.assert(lang.name = '中国', lang.name)

  var resolvedUri = require.resolve('./path/to/{xx}')
  test.assert(resolvedUri.indexOf('{brace_in_value}') > 0, resolvedUri)

  test.next()

});

