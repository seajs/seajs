
seajs.config({
  base: './multi-versions',

  alias: {
    'jq164':  'jquery/1.6.4/jquery',
    'jq171':  'jquery/1.7.1/jquery',
    'jquery': 'jquery/1.6.4/jquery'
  }
})


define(function(require) {
  var test = require('../../../test')

  test.assert(require('jq164').fn.jquery === '1.6.4', 'jq164 is ok')
  test.assert(require('jq171').fn.jquery === '1.7.1', 'jq171 is ok')
  test.assert(require('jquery').fn.jquery === '1.6.4', 'jquery is ok')

  test.next()

});

