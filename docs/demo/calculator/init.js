
seajs.config({
  alias: {
    'jquery': 'jquery/1.7.1/jquery'
  }
});


define(function(require) {

  require('./stdin').init();
  require('./stdout').init();

});
