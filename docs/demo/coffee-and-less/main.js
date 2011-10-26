
seajs.config({
  alias: {
    'coffee': 'coffee/1.1.2/coffee-script',
    'less': 'less/1.1.4/less'
  },
  preload: ['plugin-coffee', 'plugin-less']
});


define(function(require) {
  require('./style.less');

  var print = require('./print.coffee');
  print('I come from CoffeeScript.');
});
