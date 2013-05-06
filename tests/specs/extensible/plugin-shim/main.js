
seajs.config({
  base: './plugin-shim/',

  plugins: ['shim'],

  alias: {
    'jquery': {
      src: 'jquery.js',
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
    },

    'ccc': {
      src: 'deps/ccc.js',
      exports: 'ccc'
    }
  },

  preload: ['deps/ccc']
})

seajs.use('init')

