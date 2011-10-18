
seajs.config({
  alias: {
    'jquery': 'jquery/1.6.4/jquery'
  }
});


define(function(require) {

  require('./stdin').init();
  require('./stdout').init();

});
