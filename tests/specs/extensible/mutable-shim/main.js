
seajs.config({
  base: './mutable-shim/',

  plugins: ['shim'],

  shim: {
    'jquery': {
      src: 'lib/jquery.js',
      exports: 'jQuery'
    }
  }
})

seajs.on("resolve", function(data) {
  var id = data.id || ""
  var m = id.match(/^angular_(\w+)$/)

  if (m && !seajs.config.data.shim[m[0]]) {
    var shim = {}

    shim[m[0]] = {
      src: 'angular/' + m[1] + '.js',
      deps: ['jquery']
    }

    seajs.config({ shim: shim })
  }
})

seajs.use('init')

