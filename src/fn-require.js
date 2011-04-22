
/**
 * @fileoverview The factory for "require".
 */

(function(util, data, fn) {

  /**
   * The factory of "require" function.
   * @param {Object} sandbox The data related to "require" instance.
   */
  function createRequire(sandbox) {
    // sandbox: {
    //   uri: '',
    //   deps: [],
    //   parent: sandbox
    // }

    function require(id) {
      var uri = util.id2Uri(id, sandbox.uri);
      var mod;

      // Restrains to sandbox environment.
      if (util.indexOf(sandbox.deps, uri) === -1 ||
          !(mod = data.memoizedMods[uri])) {

        console.error('Invalid module:', uri);

        // Just return null when:
        //  1. the module file is 404.
        //  2. the module file is not written in valid module format.
        //  3. other error cases.
        return null;
      }

      // Checks cyclic dependencies.
      if (isCyclic(sandbox, uri)) {
        console.warn('Found cyclic dependencies:', uri);
        return mod.exports;
      }

      // Initializes module exports.
      if (!mod.exports) {
        initExports(mod, {
          uri: uri,
          deps: mod.dependencies,
          parent: sandbox
        });
      }

      return mod.exports;
    }

    return require;
  }

  function initExports(mod, sandbox) {
    var ret;
    var factory = mod.factory;

    // Attaches members to module instance.
    //mod.dependencies
    mod.uri = sandbox.uri;
    mod.id = mod.id || mod.uri;
    mod.exports = {};
    mod.load = fn.load;
    delete mod.factory; // free

    if (util.isFunction(factory)) {
      checkPotentialErrors(factory);
      ret = factory(createRequire(sandbox), mod.exports, mod);
      if (ret) {
        mod.exports = ret;
      }
    } else {
      mod.exports = factory || {};
    }
  }

  function isCyclic(sandbox, uri) {
    if (sandbox.uri === uri) {
      return true;
    }
    if (sandbox.parent) {
      return isCyclic(sandbox.parent, uri);
    }
    return false;
  }

  function checkPotentialErrors(factory) {
    if (data.config.debug &&
        factory.toString().search(/\sexports\s*=\s*[^=]/) !== -1) {
      throw 'Invalid setter: exports = {...}';
    }
  }

  fn.createRequire = createRequire;

})(seajs._util, seajs._data, seajs._fn);
