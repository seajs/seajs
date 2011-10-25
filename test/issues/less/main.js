define(function(require) {

  var test = require('../../test');
  var $ = require('jquery');

  require('./a.less');
  test.assert($('#red').width() === 200, '#red width should be 200');

  test.done();
});
