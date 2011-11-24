
seajs.config({
  alias: {
    'coffee': 'coffee/1.1.2/coffee-script',
    'less': 'less/1.1.5/less'
  },
  preload: ['plugin-coffee', 'plugin-less']
});


define(function(require) {
  require('./style.less');

  var test = require('./test.coffee');
  test.print('I come from CoffeeScript.');
});
