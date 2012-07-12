
seajs.config({
  alias: {
    'jquery': 'https://a.alipayobjects.com/static/arale/jquery/1.7.2/jquery.js'
  }
});


define(function(require) {

  require('./stdin').init();
  require('./stdout').init();

});
