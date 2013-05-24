
seajs.config({
  base: './base/'
})


define(function(require) {

  var test = require('../../../test')
  var a = require('a')

  test.assert(a.name === 'a', a.name)


  // relative
  seajs.config({
    base: './'
  })

  var base = seajs.config.data.base
  test.assert(/tests\/specs\/config\/$/.test(base), base)


  // root
  seajs.config({
    base: '/root-path/'
  })

  function expectedPath(str) {
    if (typeof process !== 'undefined') {
      return '/root-path/' + str + '.js'
    }

    return location.protocol + '//' + location.host + '/root-path/' + str + '.js'
  }

  test.assert(require.resolve('z') === expectedPath('z'),
      'actual = ' + require.resolve('z')
          + ' expected = ' + expectedPath('z'))


  // rare but allowed case
  seajs.config({
    base: '/'
  })

  base = seajs.config.data.base
  var href = (global.location || {}).href

  test.assert(!href || // For Node.js
      href.indexOf('file://') === 0 ||
      href.indexOf(base) === 0, base)


  test.next()

})

