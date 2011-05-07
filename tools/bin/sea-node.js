
/**
 * @fileoverview The seajs loader for node.
 * @author lifesinger@gmail.com(Frank Wang)
 */

var path = require('path');
var fs = require('fs');
var vm = require('vm');

var jsdom = require('jsdom').jsdom;
var document = jsdom('<!doctype html><html><head></head><body></body></html>');
var window = document.createWindow();
var location = window.location;
var navigator = window.navigator;

var baseDir = path.join(__dirname, '../../build');

var loadedModules = {};


function createSandbox(filename, exports, base) {
  exports = exports || {};
  if (base) baseDir = base;

  var module = {
    uri: filename,
    exports: exports
  };

  
  function require(id) {
    id = id.replace(/\?.*/, ''); // remove timestamp etc.

    var filepath = id;

    if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
      filepath = path.join(path.dirname(filename), id);
    }
    // top-level id
    else if (id.indexOf('/') !== 0) {
      filepath = path.join(baseDir, id);
    }

    if (!path.existsSync(filepath)) {
      filepath += '.js';
    }

    // already require()d
    var api = loadedModules[filepath];
    if (api) {
      return api;
    }

    api = loadedModules[filepath] = {};
    try {
      var code = fs.readFileSync(filepath, 'utf-8');
      var sandbox = createSandbox(filepath, api);
      vm.runInNewContext(code, sandbox);
    }
    catch(ex) {
      console.log(ex.message);
      api = loadedModules[filepath] = null;
    }

    return api;
  }


  function define() {
    var factory = arguments[arguments.length - 1];
    var ret;

    if (typeof factory === 'function') {
      ret = factory(require, exports, module);
    }
    else {
      ret = factory;
    }

    if (ret) {
      module.exports = ret;
    }

    // module.exports = xx is valid in factory.
    exports = module.exports;
  }


  return {
    define: define,
    console: console,
    document: document,
    window: window,
    location: location,
    navigator: navigator
  };
}

exports.createSandbox = createSandbox;
