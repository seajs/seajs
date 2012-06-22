define(function(require, exports, module) {

  var test = require('../../test')
  var util = seajs.pluginSDK.util


  // define
  test.assert(typeof define === 'function', 'define')

  // seajs
  test.assert(seajs.config, 'seajs.config')
  test.assert(seajs.use, 'seajs.use')
  test.assert(/\d\.\d\.\d/.test(seajs.version), seajs.version)
  test.assert(seajs.pluginSDK, 'pluginSDK')
  test.assert(getOwnPropertyCount(seajs) === 4, getOwnPropertyCount(seajs))

  // seajs.pluginSDK
  var pluginSDK = seajs.pluginSDK
  test.assert(pluginSDK.Module, 'pluginSDK.Module')
  test.assert(pluginSDK.util, 'pluginSDK.util')
  test.assert(pluginSDK.config, 'pluginSDK.config')
  test.assert(getOwnPropertyCount(pluginSDK) === 3, getOwnPropertyCount(pluginSDK))


  // seajs.pluginSDK.Module
  var Module = pluginSDK.Module
  test.assert(Module._cache, 'Module._cache')
  test.assert(Module._define, 'Module._define')
  test.assert(Module._fetch, 'Module._fetch')
  test.assert(Module._resolve, 'Module._resolve')
  test.assert(getOwnPropertyCount(Module) === 4, getOwnPropertyCount(Module))

  // seajs.pluginSDK.Module.prototype
  var MP = Module.prototype
  test.assert(MP._use, 'Module.prototype._use')
  test.assert(MP._load, 'Module.prototype._load')
  test.assert(MP._compile, 'Module.prototype._compile')
  test.assert(getOwnPropertyCount(MP) === 3, getOwnPropertyCount(MP))

  // require
  test.assert(typeof require === 'function', 'require')
  test.assert(require.cache === Module._cache, 'require.cache')
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
  test.assert(module.status === 2, 'module.status')
  test.assert(util.isObject(module.exports), 'module.exports')
  test.assert(getOwnPropertyCount(module) === 7, getOwnPropertyCount(module))


  test.done()


  function getOwnPropertyCount(o) {
    var n = 0
    for (var p in o) {
      if (o.hasOwnProperty(p)) {
        n++
      }
    }
    return n
  }

})
