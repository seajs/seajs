
seajs.config({
  base: './plugin-shim/',

  plugins: ['shim'],

  alias: {
    'jquery': {
      src: 'lib/jquery.js',
      exports: 'jQuery'
    },

    'jquery.easing': {
      src: 'lib/jquery.easing.js',
      deps: ['jquery']
    },

    'underscore': {
      src: './plugin-shim/js/underscore.js',
      exports: '_'
    },

    'backbone': {
      src: 'js/backbone.js',
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    }
  }
})

seajs.use('init')

