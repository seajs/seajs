
seajs.config({
  alias: {
    'jquery': '../../assets/jquery'
  }
});


define(function(require) {

  require('./stdin').init();
  require('./stdout').init();

});
