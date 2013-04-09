
seajs.config({
  base: './backbone-shim/',

  plugins: ['shim'],

  alias: {
    'jquery': {
      src: 'lib/jquery.js',
      exports: 'jQuery'
    },

    '_': {
      src: 'lib/underscore.js',
      exports: '_'
    },

    'backbone': {
      src: 'lib/backbone.js',
      exports: 'Backbone',
      deps: ['jquery', '_']
    }
  }
})

seajs.use('init')

