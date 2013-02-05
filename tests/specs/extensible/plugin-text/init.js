define(function(require) {

  var test = require('../../../test')

  var a = require('./a.tpl')
  var b = require('./b.tpl?v2013')
  var c = require('./c.tpl#')
  var html = require('./c.html')
  var htm = require('./c.htm')
  var d = require('text!./d.txt')

  var uri_a = require.resolve('./a.tpl')
  var uri_b = require.resolve('./b.tpl?v2013')
  var uri_c = require.resolve('./c.tpl#')
  var uri_d = require.resolve('text!./d.txt')

  test.assert(/a\.tpl!text$/.test(uri_a), uri_a)
  test.assert(/b\.tpl\?v2013!text$/.test(uri_b), uri_b)
  test.assert(/c\.tpl!text$/.test(uri_c), uri_c)
  test.assert(/d\.txt!text$/.test(uri_d), uri_d)

  test.assert(a === 'I am a template file. "\'', 'a.tpl')
  test.assert(b.length === 0, 'b.tpl?v2013')
  test.assert(c.indexOf('</div>') > 0, 'c.tpl#')
  test.assert(html.indexOf('I am a html file') > 0, 'c.html')
  test.assert(htm === html, 'c.htm')
  test.assert(d === 'd.txt', 'd.txt')

  test.next()

});

