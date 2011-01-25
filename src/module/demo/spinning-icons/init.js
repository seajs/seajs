module.declare(function(require) {

  var $ = require('jquery');

  $(document).ready(function() {
    require('./spinning').spinning($('#followIcons a'));
    $('#followIcons').show().parent().css('background', 'none');
  });

});
