
/**
 * @fileoverview Module authoring format.
 */

(function(util, data, fn) {

  /**
   * Defines a module.
   * @param {string=} name The module name.
   * @param {Array.<string>=} deps The module dependencies.
   * @param {function()|Object} factory The module factory function.
   */
  fn.define = function(name, deps, factory) {

    // Overloads arguments.
    if (util.isArray(name)) {
      factory = deps;
      deps = name;
      name = '';
    }
    else if (!util.isString(name)) {
      factory = name;
      if (util.isFunction(factory)) {
        deps = parseDependencies(factory.toString());
      }
      name = '';
    }

    var mod = { id: name, dependencies: deps || [], factory: factory };
    var uri;

    if (document.attachEvent && !window.opera) {
      // For IE6-9 browsers, the script onload event may not fire right
      // after the the script is evaluated. Kris Zyp found that it
      // could query the script nodes and the one that is in "interactive"
      // mode indicates the current script. Ref: http://goo.gl/JHfFW
      var script = util.getInteractiveScript();
      if (script) {
        uri = util.getScriptAbsoluteSrc(script);
      }

      // In IE6-9, if the script is in the cache, the "interactive" mode
      // sometimes does not work. The script code actually executes *during*
      // the DOM insertion of the script tag, so we can keep track of which
      // script is being requested in case define() is called during the DOM
      // insertion.
      else {
        uri = data.pendingModIE;
      }

      // NOTE: If the id-deriving methods above is failed, then falls back
      // to use onload event to get the module uri.
    }

    if (uri) {
      if (name) {
        uri = util.id2Uri('./' + name, uri);
      }
      util.memoize(uri, mod);
    }
    else {
      // Saves information for "real" work in the onload event.
      data.pendingMods.push(mod);
    }

  };


  function parseDependencies(code) {
    var pattern = /\brequire\s*\(\s*['"]?([^'")]*)/g;
    var ret = [], match;

    code = removeComments(code);
    while ((match = pattern.exec(code))) {
      if (match[1]) {
        ret.push(match[1]);
      }
    }

    return ret;
  }


  // http://lifesinger.org/lab/2011/remove-comments-safely/
  function removeComments(code) {
    return code
        .replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n')
        .replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\n');
  }

})(seajs._util, seajs._data, seajs._fn);
