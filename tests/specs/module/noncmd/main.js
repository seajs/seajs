define(function(require) {

  var test = require('../../../test')

  var a = require('./a')
  test.assert(a === void 0, 'noncmd module return undefined')
  var mod = seajs.cache[seajs.resolve('noncmd/a', seajs.data.cwd)]
  test.assert(mod.hasOwnProperty('exports') === false, 'noncmd module has no property "exports"')
  test.assert(mod.non === true, 'noncmd module has a property "non"')

  var b = require('./b')
  test.assert(b === null, 'cmd module has property "exports" always return null')
  mod = seajs.cache[seajs.resolve('noncmd/b', seajs.data.cwd)]
  test.assert(mod.hasOwnProperty('exports') === true, 'cmd module has property "exports" always return null')

  var c = require('./c')
  test.assert(c.toString() === '[object Object]', 'cmd module has property "exports" always no return')
  mod = seajs.cache[seajs.resolve('noncmd/c', seajs.data.cwd)]
  test.assert(mod.hasOwnProperty('exports') === true, 'cmd module has property "exports" always no return')

  var d = require('./d')
  test.assert(d.toString() === '[object Object]', 'cmd module has property "exports" always return undefined')
  mod = seajs.cache[seajs.resolve('noncmd/d', seajs.data.cwd)]
  test.assert(mod.hasOwnProperty('exports') === true, 'cmd module has property "exports" always return undefined')

  test.next()

});
