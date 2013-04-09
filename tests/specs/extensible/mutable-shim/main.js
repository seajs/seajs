
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

  if (m && !seajs.config.data.alias[m[0]]) {
    var alias = {}

    alias[m[0]] = {
      src: 'angular/' + m[1] + '.js',
      deps: ['jquery']
    }

    seajs.config({ alias: alias })
  }
})

seajs.use('init')

