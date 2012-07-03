define(function(require, exports, module) {

  var test = require('../../test')
  var util = seajs.pluginSDK.util


  // define
  test.assert(typeof define === 'function', 'define')

  // seajs
  test.assert(seajs.config, 'seajs.config')
  test.assert(seajs.use, 'seajs.use')
  test.assert(seajs.modify, 'seajs.modify')
  test.assert(seajs.log, 'seajs.log')
  test.assert(seajs.cache, 'seajs.cache')
  test.assert(seajs.find, 'seajs.find')
  test.assert(seajs.importStyle, 'seajs.importStyle')
  test.assert(/\d\.\d\.\d/.test(seajs.version), seajs.version)
  test.assert(seajs.pluginSDK, 'pluginSDK')
  test.assert(getOwnPropertyCount(seajs) === 9, getOwnPropertyCount(seajs))

  // seajs.pluginSDK
  var pluginSDK = seajs.pluginSDK
  test.assert(pluginSDK.Module, 'pluginSDK.Module')
  test.assert(pluginSDK.util, 'pluginSDK.util')
  test.assert(pluginSDK.config, 'pluginSDK.config')
  test.assert(getOwnPropertyCount(pluginSDK) === 3, getOwnPropertyCount(pluginSDK))


  // seajs.pluginSDK.Module
  var Module = pluginSDK.Module
  test.assert(Module.STATUS, 'Module.STATUS')
  test.assert(Module._resolve, 'Module._resolve')
  test.assert(Module._fetch, 'Module._fetch')
  test.assert(Module._define, 'Module._define')
  test.assert(Module._getCompilingModule, 'Module._getCompilingModule')
  test.assert(Module.cache, 'Module.cache')
  test.assert(Module._find, 'Module._find')
  test.assert(Module._modify, 'Module._modify')
  test.assert(getOwnPropertyCount(Module) === 8, getOwnPropertyCount(Module))

  // seajs.pluginSDK.Module.prototype
  var MP = Module.prototype
  test.assert(MP._use, 'Module.prototype._use')
  test.assert(MP._load, 'Module.prototype._load')
  test.assert(MP._compile, 'Module.prototype._compile')
  test.assert(getOwnPropertyCount(MP) === 3, getOwnPropertyCount(MP))

  // require
  test.assert(typeof require === 'function', 'require')
  test.assert(require.cache === Module.cache, 'require.cache')
  test.assert(require.resolve, 'require.resolve')
  test.assert(require.async, 'require.async')
  test.assert(getOwnPropertyCount(require) === 3, getOwnPropertyCount(require))

  // exports
  test.assert(exports === module.exports, 'exports')

  // module
  test.assert(module instanceof Module, 'module')
  test.assert(util.isString(module.id), 'module.id')
  test.assert(util.isArray(module.dependencies), 'module.dependencies')
  test.assert(util.isFunction(module.factory), 'module.factory')
  test.assert(util.isObject(module.exports), 'module.exports')
  test.assert(module.parent instanceof Module, 'module.parent')
  test.assert(module.parent.parent === undefined, 'module.parent.parent')
  test.assert(module.status === Module.STATUS.COMPILING, 'module.status')
  test.assert(util.isObject(module.exports), 'module.exports')
  test.assert(util.isFunction(module.require), 'module.require')
  test.assert(getOwnPropertyCount(module) === 8, getOwnPropertyCount(module))


  test.done()


  function getOwnPropertyCount(o) {
    var n = 0
    for (var p in o) {
      // 低版本 safari 会枚举出 prototype
      if (o.hasOwnProperty(p) && p !== 'prototype') {
        n++
      }
    }
    return n
  }

})
