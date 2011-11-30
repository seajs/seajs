/**
 * Adds the capability to load SeaJS modules from NodeJS applications.
 * @author lifesinger@gmail.com
 */

var MP = module.constructor.prototype;
var _compile = MP._compile;
var moduleStack = [];
var helper = require('./helper');


MP._compile = function(content, filename) {
  moduleStack.push(this);
  try {
    return _compile.call(this, content, filename);
  }
  finally {
    moduleStack.pop();
  }
};


/**
 * Only support this format:
 *   define(function(require, exports, module) { ... })
 */
global.define = function(factory) {
  var returned = factory;
  var module = moduleStack[moduleStack.length - 1] || require.main;

  if (typeof factory === 'function') {
    returned = factory.call(
        global,
        helper.createRequire(module),
        module.exports,
        module);
  }

  if (returned !== undefined) {
    module.exports = returned;
  }
};

/**
 * Thanks to
 *  - https://github.com/joyent/node/blob/master/lib/module.js
 *  - https://github.com/ajaxorg/node-amd-loader/blob/master/lib/amd-loader.js
 */
