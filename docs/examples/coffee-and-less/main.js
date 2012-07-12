define(function(require) {
  require('./style.less');

  var test = require('./test.coffee');
  test.print('I come from CoffeeScript.');
});
