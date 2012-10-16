define(function(require, exports, module) {

  var $ = require('jquery')


  function Hello(message) {
    this.message = message
  }

  Hello.prototype.renderTo = function(container) {
    $('<p class="hello">Hello, ' + this.message + ' !</p>')
        .appendTo(container)
        .fadeOut(60000)

  }

  module.exports = Hello
})
