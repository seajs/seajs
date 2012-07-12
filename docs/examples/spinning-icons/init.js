
seajs.config({
  alias: {
    'jquery': 'https://a.alipayobjects.com/static/arale/jquery/1.7.2/jquery.js'
  }
});


define(function(require) {

  var $ = require('jquery');

  $(function() {
    require('./spinning').spinning($('#followIcons a'));
    $('#followIcons').show().parent().css('background', 'none');
  });

});
