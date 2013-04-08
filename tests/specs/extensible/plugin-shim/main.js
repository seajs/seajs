console.log(seajs.config.data.base)

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
    },

    'aaa': {
      src: (seajs.config.data.base + 'plugin-shim/deps/aaa.js').replace('http:', ''),
      exports: 'aaa'
    },

    'bbb': {
      src: 'deps/bbb.js',
      deps: ['aaa'],
      exports: 'bbb'
    }
  }
})

seajs.use('init')

