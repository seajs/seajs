
seajs.config({

  base: './plugin-shim/',

  plugins: 'shim',

  shim: {
    'jquery': {
      exports: 'jQuery'
    },

    'jquery-plugins': {
      match: /jquery\.[a-z].*\.js/,
      deps: ['jquery'],
      exports: function() {
        return jQuery
      }
    }
  }

})

seajs.use('init')

