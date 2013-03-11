
seajs.config({
  base: './mutable-shim/',

  plugins: ['shim'],

  alias: {
    'jquery': {
      src: 'lib/jquery.js',
      exports: 'jQuery'
    }
  }
})

seajs.on("resolve", function(data) {
  var id = data.id || ""
  var m = id.match(/^angular_(\w+)$/)
return;
  if (m && !seajs.config.data.alias[m[0]]) {
    var shim = {}

    shim[m[0]] = {
      src: 'angular/' + m[1] + '.js',
      deps: ['jquery']
    }

    seajs.config({ alias: shim })
  }
})

seajs.use('init')

