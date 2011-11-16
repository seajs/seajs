
/**
 * @fileoverview Module authoring format.
 */

(function(util, data, fn) {

  /**
   * Defines a module.
   * @param {string=} id The module id.
   * @param {Array.<string>|string=} deps The module dependencies.
   * @param {function()|Object} factory The module factory function.
   */
  fn.define = function(id, deps, factory) {
    var argsLen = arguments.length;

    // define(factory)
    if (argsLen === 1) {
      factory = id;
      id = undefined;
    }
    // define(id || deps, factory)
    else if (argsLen === 2) {
      factory = deps;
      deps = undefined;

      // define(deps, factory)
      if (util.isArray(id)) {
        deps = id;
        id = undefined;
      }
    }

    // Parse dependencies
    if (!util.isArray(deps) && util.isFunction(factory)) {
      deps = parseDependencies(factory.toString());
    }

    var mod = new fn.Module(id, deps, factory);

    // Memoize specific modules immediately
    if (id) {
      util.memoize(util.id2Uri(id), mod);
      return;
    }

    // Handle anonymous modules
    if (document.attachEvent && !util.isOpera) {

      // Try to get the current script
      var script = util.getCurrentScript();
      if (script) {
        var url = util.unParseMap(util.getScriptAbsoluteSrc(script));
      }

      if (url) {
        util.memoize(url, mod);
      }
      else {
        util.warn('Failed to derive url of the following anonymous module:',
            factory.toString());
      }
    }
    else {
      // Saves information for "memoizing" work in the onload event.
      data.anonymousMod = mod;
    }
  };


  function parseDependencies(code) {
    // Parse these `requires`:
    //   var a = require('a');
    //   someMethod(require('b'));
    //   require('c');
    //   ...
    // Doesn't parse:
    //   someInstance.require(...);
    var pattern = /(?:^|[^.])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g;
    var ret = [], match;

    code = removeComments(code);
    while ((match = pattern.exec(code))) {
      if (match[2]) {
        ret.push(match[2]);
      }
    }

    return util.unique(ret);
  }


  // http://lifesinger.github.com/lab/2011/remove-comments-safely/
  function removeComments(code) {
    return code
        .replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n')
        .replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\n');
  }

})(seajs._util, seajs._data, seajs._fn);
