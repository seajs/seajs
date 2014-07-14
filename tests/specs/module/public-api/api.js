define(function(require, exports, mod) {

  var test = require('../../../test')
  var assert = test.assert

  var toString = {}.toString

  function isFunction(obj) {
    return toString.call(obj) === "[object Function]"
  }

  var isArray = Array.isArray || function(obj) {
    return toString.call(obj) === "[object Array]"
  }


  // seajs
  assert(seajs, 'seajs')
  assert(typeof(seajs.version) === 'string', seajs.version)

  assert(isFunction(seajs.config), 'seajs.config')
  assert(isFunction(seajs.use), 'seajs.use')

  assert(isFunction(seajs.on), 'seajs.on')
  assert(isFunction(seajs.emit), 'seajs.emit')
  assert(isFunction(seajs.off), 'seajs.off')

  assert(typeof(seajs.cache) === 'object', 'seajs.cache')
  assert(typeof(seajs.data) === 'object', 'seajs.data')
  assert(typeof(seajs.data.events) === 'object', 'data.events')
  assert(typeof(seajs.data.fetchedList) === 'object', 'data.fetchedList')
  assert(isFunction(seajs.data.cid), 'data.cid')

  assert(isFunction(seajs.Module), 'seajs.Module')
  assert(isFunction(seajs.resolve), 'seajs.resolve')
  assert(isFunction(seajs.request), 'seajs.request')
  assert(isFunction(seajs.require), 'seajs.require')

  assert(getOwnPropertyCount(seajs) === 12, getOwnPropertyCount(seajs))


  // define
  assert(isFunction(define), 'define')
  assert(typeof define.cmd === 'object', 'define.cmd')

  assert(getOwnPropertyCount(define) === 1, getOwnPropertyCount(define))


  // Module
  var Module = seajs.Module
  assert(typeof Module.STATUS === 'object', 'Module.STATUS')

  assert(isFunction(Module.resolve), 'Module.resolve')
  assert(isFunction(Module.define), 'Module.define')
  assert(isFunction(Module.save), 'Module.save')
  assert(isFunction(Module.get), 'Module.get')
  assert(isFunction(Module.use), 'Module.use')
//  assert(isFunction(Module.preload), 'Module.preload')

  assert(isFunction(Module.prototype.resolve), 'Module.prototype.resolve')
  assert(isFunction(Module.prototype.load), 'Module.prototype.load')
  assert(isFunction(Module.prototype.onload), 'Module.prototype.onload')
  assert(isFunction(Module.prototype.fetch), 'Module.prototype.fetch')
  assert(isFunction(Module.prototype.exec), 'Module.prototype.exec')

  assert(getOwnPropertyCount(Module) === 6, getOwnPropertyCount(Module))
  assert(getOwnPropertyCount(Module.prototype) === 7, getOwnPropertyCount(Module.prototype))

  
  // require
  assert(isFunction(require), 'require')
  assert(isFunction(require.resolve), 'require.resolve')
  assert(isFunction(require.async), 'require.async')
  assert(getOwnPropertyCount(require) === 2, getOwnPropertyCount(require))

  
  // exports
  assert(exports === mod.exports, 'exports')

  
  // module
  assert(mod instanceof Module, 'module')

  assert(typeof mod.id === 'string', 'module.id')
  assert(typeof mod.uri === 'string', 'module.uri')
  assert(isArray(mod.dependencies), 'module.dependencies')
  assert(typeof mod.exports === 'object', 'module.exports')
  assert(isFunction(mod.factory), 'module.factory')
  assert(mod.status === 5, 'module.status')

//  assert(typeof mod._waitings === 'object', 'module._waitings')
//  assert(typeof mod._remain === 'number', 'module._remain')
//  assert(typeof mod._resolveCache === 'object', 'module._resolveCache')
//  assert(typeof mod._callback === 'object', 'module._callback')
  assert(isArray(mod._entry), 'module._entry')
  assert(typeof mod.deps === 'object', 'module.deps')

  //assert(typeof mod.options === 'object', 'module.options')
  //assert(mod.parent instanceof Module, 'module.parent')
  //assert(mod.parent.parent === undefined, 'module.parent.parent')
  //assert(isFunction(mod.load), 'module.load')

  assert(getOwnPropertyCount(mod) === 8, getOwnPropertyCount(mod))


  test.next()


  function getOwnPropertyCount(o) {
    var n = 0
    for (var p in o) {
      // Old safari would get prototype
      if (o.hasOwnProperty(p) && p !== 'prototype') {
        n++
      }
    }
    return n
  }

})
