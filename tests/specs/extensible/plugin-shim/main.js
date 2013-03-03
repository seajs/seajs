
seajs.config({
  base: './non-cmd/',

  plugins: ['shim'],

  shim: {
    'jquery': {
      src: 'lib/jquery.js',
      exports: 'jQuery'
    },
    'jquery.easing': {
      src: 'lib/jquery.easing.js',
      deps: ['jquery'],
      exports: function() {
        jQuery.hacked = true
        return jQuery
      }
    }
  }
})

seajs.use('init')

