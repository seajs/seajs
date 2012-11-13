
define(function(require, exports) {

  var $ = require('jquery');
  var controller = require('./controller');
  var view = require('./view');

  var specialKeys = {
    '8': 'delete',
    '13': 'enter',
    '27': 'esc'
  };

  exports.init = function() {

    view.init();

    $('#keyboard').delegate('div', 'click', function() {
      controller.handleInput($(this).text());
    });

    $(document).keypress(function(ev) {
      var keyCode = ev.keyCode;
      if (keyCode === 8) {
        ev.preventDefault();
      }

      var val = specialKeys[keyCode];
      if (!val) {
        val = String.fromCharCode(ev.which);
      }

      controller.handleInput(val);
    });

  };

});
