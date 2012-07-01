/**
 * init module for seajs.org
 */

seajs.config({
  alias: {
    'jquery': 'https://a.alipayobjects.com/static/arale/jquery/1.7.2/jquery.js',
    'github': 'http://lepture.github.com/github.js/src/github.js',
    'github-render': 'http://lepture.github.com/github.js/src/render.js'
  }
})

define(function(require) {

  require('./highlight').init()

  require.async(['jquery', './hello', 'github', 'github-render'], function($, hello, github, render) {

    // first example
    $('#beautiful-sea').click(hello.sayHello)

    // github items
    github('seajs/seajs').issues({ callback: render.issues });
    github('seajs/seajs').commits({ callback: render.commits });
  })

})
