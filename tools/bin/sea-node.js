
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


function createSandbox(filename, mod, base) {
  mod = mod || {};
  mod.uri = filename;
  mod.exports = {};

  if (base) baseDir = base;

  
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
    var requiringMod = loadedModules[filepath];
    if (requiringMod) {
      return requiringMod.exports;
    }

    requiringMod = loadedModules[filepath] = {};
    try {
      var code = fs.readFileSync(filepath, 'utf-8');
      var sandbox = createSandbox(filepath, requiringMod);
      vm.runInNewContext(code, sandbox);
    }
    catch(ex) {
      console.log(ex.message);
      requiringMod.exports = null;
    }

    return requiringMod.exports;
  }


  function define() {
    var factory = arguments[arguments.length - 1];
    var ret;

    if (typeof factory === 'function') {
      ret = factory(require, mod.exports, mod);
    }
    else {
      ret = factory;
    }

    if (ret) {
      mod.exports = ret;
    }
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
