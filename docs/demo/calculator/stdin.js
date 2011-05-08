
define(function(require, exports) {

  var $ = require('jquery');
  var calculator = require('./calculator');

  var specialKeys = {
    '8': 'delete',
    '13': 'enter',
    '27': 'esc'
  };

  exports.init = function() {

    $('#keyboard').delegate('div', 'click', function() {
      calculator.handleInput($(this).text());
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

      calculator.handleInput(val);
    });

  };

});
