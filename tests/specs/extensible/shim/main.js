
seajs.config({
  base: './shim/'
})

define('jquery', ['jquery-1.9.1.min.js'], function() { return $ })
//define('jquery-easing', ['jquery'], function() { return $ })

seajs.use('init')

