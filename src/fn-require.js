
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
      var mod = data.memoizedMods[uri];

      // Just return null when:
      //  1. the module file is 404.
      //  2. the module file is not written with valid module format.
      //  3. other error cases.
      if (!mod) {
        return null;
      }

      // Checks cyclic dependencies.
      if (isCyclic(sandbox, uri)) {
        util.error({
          message: 'found cyclic dependencies',
          from: 'require',
          uri: uri,
          type: 'warn'
        });

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
    mod.exports = {};
    mod.load = fn.load;
    delete mod.id; // just keep mod.uri
    delete mod.factory; // free

    if (util.isFunction(factory)) {
      checkPotentialErrors(factory, mod.uri);
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

  function checkPotentialErrors(factory, uri) {
    if (factory.toString().search(/\sexports\s*=\s*[^=]/) !== -1) {
      util.error({
        message: 'found invalid setter: exports = {...}',
        from: 'require',
        uri: uri,
        type: 'error'
      });
    }
  }

  fn.createRequire = createRequire;

})(seajs._util, seajs._data, seajs._fn);
