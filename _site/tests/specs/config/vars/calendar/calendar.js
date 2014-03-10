define(function(require) {

  var lang = require('./i18n/{locale}.js')

  function Calendar() {
    this.msg = lang.msg
  }

  return Calendar
})
