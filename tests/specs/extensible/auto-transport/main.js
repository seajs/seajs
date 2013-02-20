
seajs.on('compiled', function(mod) {
  if (mod.uri.indexOf('jquery.js') > -1) {
    global.jQuery = global.$ = mod.exports
  }
})

seajs.on('compile', function(mod) {
  if (mod.uri.indexOf('cookie.js') > -1) {
    mod.exports = $.cookie
  }
})

seajs.config({
  preload: ['./auto-transport/jquery']
}).use('./auto-transport/init')

