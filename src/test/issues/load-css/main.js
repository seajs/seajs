
seajs.config({
  timeout: 5000
});


define(function(require, exports, module) {

  var $ = require('jquery');


  require('./red.css');
  assert($('#red').width() === 200);


  assert($('#blue').width() !== 200);
  module.load('./blue.css', function() {
    assert($('#blue').width() === 200);
  });


  module.load('./notExisted.css', function() {
    print('404!');
  });


  print('****NOTICE: 404 will occur after 5 second (timeout) in Opera.');

  
  function assert(guard) {
    print(guard ? 'It works!' : 'It failed!');
  }

  function print(msg) {
    $('<p/>').html(msg).appendTo($('#out'));
  }

});
