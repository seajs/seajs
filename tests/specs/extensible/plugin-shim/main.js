
seajs.config({
  base: './plugin-shim/',

  plugins: ['shim'],

  shim: {
    'jquery': {
      src: 'lib/jquery.js',
      exports: 'jQuery'
    },

    'jquery.easing': {
      src: 'lib/jquery.easing.js',
      deps: ['jquery']
    }
  }
})

seajs.use('init')

