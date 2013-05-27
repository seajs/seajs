
seajs.config({
  base: './non-cmd/'
})

define('jquery.easing',
    ['lib/jquery.js', 'lib/jquery.easing.js'],
    function() {
      return global.jQuery
    },
    { order: true }
)

seajs.use('init')

