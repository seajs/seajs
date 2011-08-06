define(function(require) {

  var test = require('../../test');

  A.use('jquery', function($) {
    test.assert($.fn.jquery == '1.6.1', $.fn.jquery);
  });

  B.use('jquery', function($) {
    test.assert($.fn.jquery == '1.6.2', $.fn.jquery);
  });

});