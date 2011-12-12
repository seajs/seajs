
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
  function define(id, deps, factory) {
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

    // Get url directly for specific modules.
    if (id) {
      var uri = util.id2Uri(id);
    }
    // Try to derive url in IE6-9 for anonymous modules.
    else if (document.attachEvent && !util.isOpera) {

      // Try to get the current script
      var script = util.getCurrentScript();
      if (script) {
        uri = util.unParseMap(util.getScriptAbsoluteSrc(script));
      }

      if (!uri) {
        util.log('Failed to derive URL from interactive script for:',
            factory.toString());

        // NOTE: If the id-deriving methods above is failed, then falls back
        // to use onload event to get the url.
      }
    }

    var mod = new fn.Module(id, deps, factory);

    if (uri) {
      util.memoize(uri, mod);
      data.packageMods.push(mod);
    }
    else {
      // Saves information for "memoizing" work in the onload event.
      data.anonymousMod = mod;
    }

  }


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


  fn.define = define;

})(seajs._util, seajs._data, seajs._fn);
