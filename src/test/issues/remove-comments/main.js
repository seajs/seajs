
define(function(require, exports, module) {

  var $ = require('jquery');


  // require('./a')

  /**
   * require('./b')
   */

  require('./c');


  assert(this.a === undefined);
  assert(this.b === undefined);
  assert(this.c === 'c');


  function assert(guard) {
    print(guard ? 'It works!' : 'It failed!');
  }

  function print(msg) {
    $('<p/>').html(msg).appendTo($('#out'));
  }

});
