/**
 * init module for seajs.org
 */

seajs.config({
  alias: {
    'jquery': 'https://a.alipayobjects.com/static/arale/jquery/1.7.2/jquery.js',
    'github': 'http://lepture.github.com/github.js/src/github.js'
  }
})

define(function(require) {

  require('./highlight').init()

  require.async(['jquery', './hello', 'github'], function($, hello, github) {
    $('#beautiful-sea').click(hello.sayHello)
    github('seajs').commits({ repo: 'seajs' })
  })

})
