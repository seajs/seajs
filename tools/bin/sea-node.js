
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

var defaultBase = path.join(__dirname, '../../build');


function createSandbox(filename, exports, base) {
  exports = exports || {};

  var module = {
    uri: filename,
    exports: exports
  };

  function require(id) {
    var filepath = id;
    if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
      filepath = path.join(path.dirname(filename), id);
    }
    // top-level id
    else if(id.indexOf('/') !== 0) {
      filepath = path.join(base || defaultBase, id);
    }

    if(!path.existsSync(filepath)) {
      filepath += '.js';
    }

    var api = {};
    var code = fs.readFileSync(filepath, 'utf-8');
    var sandbox = createSandbox(filepath, api);
    vm.runInNewContext(code, sandbox);

    return api;
  }

  function define() {
    var factory = arguments[arguments.length - 1];
    factory(require, exports, module);
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
