
seajs.config({
  base: './base/'
})


define(function(require) {

  var test = require('../../../test')
  var a = require('a')

  test.assert(a.name === 'a', a.name)


  // relative
  seajs.config({
    base: '.'
  })

  var base = seajs.data.base
  test.assert(/tests\/specs\/config\/$/.test(base), base)


  // root
  seajs.config({
    base: '/root-path'
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


  // DO NOT run in Node.js & file:/// environment
  if (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0) {
    // default protocol
    seajs.config({
      base: '//' + location.host + '/root-path/'
    })

    test.assert(require.resolve('z') === expectedPath('z'),
        'actual = ' + require.resolve('z')
            + ' expected = ' + expectedPath('z'))
  }


  /* REMOVE support for this rare case
  // and RECOMMEND to place config before all modules
  // https://github.com/seajs/seajs/blob/f84c0d8ad1adf61148ac40683869906566b028ee/src/module.js
  //
  // base path is changed dynamically
  seajs.config({
    base: './base/c'
  })

  define('c', ['c-1'], function(r, exports) {
    exports.name = r('c-1').name
  })

  seajs.config({
    base: './base'
  })

  seajs.use('c/c', function(c) {
    test.assert(c.name === 'c-1', c.name)
  })
  */


  test.next()

})

