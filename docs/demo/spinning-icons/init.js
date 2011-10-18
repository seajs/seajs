
seajs.config({
  alias: {
    'jquery': 'jquery/1.6.4/jquery'
  }
});


define(function(require) {

  var $ = require('jquery');

  $(document).ready(function() {
    require('./spinning').spinning($('#followIcons a'));
    $('#followIcons').show().parent().css('background', 'none');
  });

});
