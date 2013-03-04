
seajs.config({
  base: './non-cmd/',

  alias: {
    'jquery-src': 'lib/jquery.js',
    'jquery.easing-src': 'lib/jquery.easing.js'
  }
})



define('jquery.easing-src', ['jquery-src'])

define('jquery.easing', ['jquery.easing-src'], function() {
  return global.jQuery
})

define('jquery', ['jquery-src'], function() {
  return global.jQuery
})


seajs.use('init')

