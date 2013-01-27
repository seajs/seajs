
seajs.on('compiled', function(mod) {
  if (mod.uri.indexOf('jquery.js') > -1) {
    window.jQuery = window.$ = mod.exports
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

