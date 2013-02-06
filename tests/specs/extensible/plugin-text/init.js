define(function(require) {

  var test = require('../../../test')


  // text

  var a = require('./a.tpl')
  var b = require('./b.tpl?v2013')
  var c = require('./c.tpl#')
  var html = require('./c.html')
  var htm = require('text!./c.htm')
  var d = require('text!./d.txt')

  var uri_a = require.resolve('./a.tpl')
  var uri_b = require.resolve('./b.tpl?v2013')
  var uri_c = require.resolve('./c.tpl#')
  var uri_d = require.resolve('text!./d.txt')

  test.assert(/a\.tpl$/.test(uri_a), uri_a)
  test.assert(/b\.tpl\?v2013$/.test(uri_b), uri_b)
  test.assert(/c\.tpl$/.test(uri_c), uri_c)
  test.assert(/d\.txt$/.test(uri_d), uri_d)

  test.assert(a === 'I am a template file. "\'', 'a.tpl')
  test.assert(b.length === 0, 'b.tpl?v2013')
  test.assert(c.indexOf('</div>') > 0, 'c.tpl#')
  test.assert(html.indexOf('I am a html file') > 0, 'c.html')
  test.assert(htm === html, 'c.htm')
  test.assert(d === 'd.txt', 'd.txt')


  // json

  var jsonA = require('json!./a.json')
  var jsonB = require('./b.json?t=30222')

  test.assert(jsonA.name === 'a', jsonA.name)
  test.assert(typeof jsonA.n === 'number', typeof jsonA.n)
  test.assert(jsonB.name === 'b', jsonB.name)
  test.assert(jsonB.foo === "'bar'\"", jsonB.foo)

  test.assert(/\.json$/.test(require.resolve('path/to/d.json')), require.resolve('path/to/d.json'))
  test.assert(require.resolve('d') === require.resolve('path/to/d.json'), require.resolve('d'))
  test.assert(require.resolve('json!d') === require.resolve('d'), require.resolve('json!d'))


  test.next()

});

