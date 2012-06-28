/**
 * Adds the capability to load SeaJS modules in node environment.
 * @author lifesinger@gmail.com
 */

var Module = module.constructor
var helper = require('./helper')


// Hack to get current compiling module
var _compile = Module.prototype._compile
var moduleStack = []

Module.prototype._compile = function(content, filename) {
  moduleStack.push(this)
  try {
    return _compile.call(this, content, filename)
  }
  finally {
    moduleStack.pop()
  }
}


// Hack for parsing alias in id
var _resolveFilename = Module._resolveFilename

Module._resolveFilename = function(request, parent) {
  request = request.replace(/\?.*$/, '') // remove timestamp etc.
  request = helper.parseAlias(request)
  return _resolveFilename(request, parent)
}


// Define seajs
global.seajs = { config: helper.configFn }


// Define `define` function
global.define = function(factory) {
  var ret = factory
  var module = moduleStack[moduleStack.length - 1] || require.main

  // Only support this format:
  //   define(function(require, exports, module) { ... })
  if (typeof factory === 'function') {
    helper.decorateModule(module)

    ret = factory.call(
        global,
        module.require,
        module.exports,
        module)
  }

  if (ret !== undefined) {
    module.exports = ret
  }
}


/**
 * Thanks to
 *  - https://github.com/joyent/node/blob/master/lib/module.js
 *  - https://github.com/ajaxorg/node-amd-loader/blob/master/lib/amd-loader.js
 */
